/**
 * Core Agent Execution Engine
 * Handles: Claude API calls, streaming, persistence, state management,
 * prompt governance, output validation, and provenance recording.
 */

import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
import { classifyError } from '@/lib/observability/failure-classification';
import { RoleArchetype, GapClassification, PatternCategory, Prisma } from '@prisma/client';
import {
  AgentType,
  AgentPromptContext,
  getAgentSystemPrompt,
  buildAgentUserPrompt,
} from '../prompts/prompts';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
} from '../telemetry/redis-integration';
import { appendExecutionLog } from '../core/store';
import { getActivePromptVersion } from '@/lib/governance/promptRegistry';
import { validateAgentOutput, VALIDATION_VERSION } from '@/lib/governance/outputValidator';
import { assertQualified } from '@/lib/governance/providerQualification';
import type { LLMProviderName } from '@/lib/llm/provider';
import { inspectForHallucinations, inspectInputForInjection } from '@/lib/governance/hallucinationControls';
import { checkExecutionPolicy, estimateCostUsd, getPolicy } from '@/lib/governance/policyEngine';

import { transitionExecutionState } from '@/lib/runtime/execution-state-machine';
import { trace as otelTrace, SpanStatusCode } from '@opentelemetry/api';
import { getLangfuse } from '@/platform/ai-observability/langfuse';

const executionLogger = createLogger({ component: 'agent-executor' });

export interface ExecutionContext {
  executionId: string;
  agentType: AgentType;
  promptContext: AgentPromptContext;
  userId: string;
  correlationId?: string;
  requestId?: string;
}

export async function executeAgent(context: ExecutionContext): Promise<void> {
  const { executionId, agentType, promptContext, userId, correlationId, requestId } = context;
  const executionStartedAt = Date.now();
  const logContext = { executionId, agentType, userId, correlationId, requestId };

  const otelTracer = otelTrace.getTracer('career-propel');
  const agentSpan = otelTracer.startSpan(`agent.${agentType}`, {
    attributes: {
      'agent.type': agentType,
      'execution.id': executionId,
      'user.id': userId,
      'correlation.id': correlationId || '',
      'request.id': requestId || '',
    }
  });

  const langfuse = getLangfuse();
  let lfTrace = null;
  let lfGeneration = null;

  if (langfuse) {
    lfTrace = langfuse.trace({
      id: executionId,
      name: `agent:${agentType}`,
      userId,
      metadata: {
        correlationId,
        requestId,
      },
    });
  }

  try {
    try {
    // Transition to running state via state machine
    await transitionExecutionState(executionId, 'running', {
      actor: 'agent-executor',
      correlationId,
      requestId,
      userId,
    });

    // Publish Redis events
    const inputContext =
      typeof context.promptContext === 'string'
        ? JSON.parse(context.promptContext)
        : context.promptContext;

    await publishAgentStarted(userId, executionId, agentType, inputContext);
    await publishAgentStatus(
      userId,
      executionId,
      agentType,
      'running',
      0,
      `Starting ${agentType} agent...`
    );

    // ── Policy Check: concurrency + input size pre-flight ────────────────────
    {
      const allInputChars = Object.values(promptContext).join('').length;
      const concurrentCount = await prisma.agentExecution.count({
        where: { userId, status: 'running' },
      });
      const policyCheck = checkExecutionPolicy(agentType, {
        inputChars: allInputChars,
        concurrentCount,
      });
      if (!policyCheck.allowed) {
        throw new Error(`Policy violation: ${policyCheck.violations.map((v) => v.message).join('; ')}`);
      }
    }

    // ── Input injection check ─────────────────────────────────────────────────
    {
      const allInputText = Object.values(promptContext).filter(Boolean).join('\n');
      const injectionResult = inspectInputForInjection(allInputText);
      if (!injectionResult.clean) {
        throw new Error(`Prompt injection detected in input: ${injectionResult.patterns.join(', ')}`);
      }
    }

    // ── Provider Qualification: fail-fast before LLM dispatch ────────────────
    {
      const { getLLMProvider } = await import('@/lib/llm/provider');
      const providerClient = getLLMProvider();
      assertQualified(agentType, providerClient.name, process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6');
    }

    // ── Prompt Governance: resolve active versioned prompt ────────────────────
    const promptVersion = await getActivePromptVersion(agentType);
    const rawSystemPrompt = getAgentSystemPrompt(agentType);
    const rawUserPrompt = buildAgentUserPrompt(agentType, promptContext);

    const { compressPrompt } = await import('../prompts/compression');
    const systemPrompt = compressPrompt(rawSystemPrompt);
    const userPrompt = compressPrompt(rawUserPrompt);

    const promptHash = crypto.createHash('sha256').update(userPrompt, 'utf8').digest('hex');

    // Record prompt version on execution record
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        promptVersionId: promptVersion.id,
        promptHash,
        sanitizerVersion: promptVersion.sanitizerVersion,
      },
    });

    executionLogger.info({ ...logContext, promptVersionId: promptVersion.id, promptVersion: promptVersion.version }, 'Agent execution started');

    // Stream from LLM provider
    let fullResponse = '';
    let tokenCount = 0;
    let inputTokens = 0;
    let outputTokens = 0;
    const startTime = Date.now();

    let usedProvider: LLMProviderName | undefined;
    let usedModel: string | undefined;

    const providerSpan = otelTracer.startSpan('provider.call', {
      attributes: {
        'llm.provider': 'anthropic',
        'llm.model': process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      }
    });

    if (lfTrace) {
      lfGeneration = lfTrace.generation({
        name: `call:${agentType}`,
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        input: userPrompt,
        modelParameters: {
          temperature: 0.7,
          maxTokens: 4096,
          systemPrompt,
        },
      });
    }

    try {
      // Use callLLM for first pass (gets token counts); falls back to stream if needed
      const result = await callLLM(
        [{ role: 'user', content: userPrompt }],
        {
          systemPrompt,
          temperature: 0.7,
          maxTokens: 4096,
        }
      );
      fullResponse = result.content;
      inputTokens = result.inputTokens;
      outputTokens = result.outputTokens;
      tokenCount = result.totalTokens;

      // Capture provider/model from provider instance
      const { getLLMProvider } = await import('@/lib/llm/provider');
      const providerClient = getLLMProvider();
      usedProvider = providerClient.name as LLMProviderName;
      usedModel = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

      providerSpan.setAttributes({
        'llm.provider': usedProvider,
        'llm.model': usedModel,
        'llm.usage.input_tokens': inputTokens,
        'llm.usage.output_tokens': outputTokens,
        'llm.usage.total_tokens': tokenCount,
      });
      providerSpan.setStatus({ code: SpanStatusCode.OK });

      if (lfGeneration) {
        lfGeneration.update({
          output: fullResponse,
          model: usedModel,
          usage: {
            input: inputTokens,
            output: outputTokens,
            total: tokenCount,
          },
        });
      }

      // Assert provider qualification before accepting the result
      assertQualified(agentType, usedProvider, usedModel);
    } catch (streamError) {
      const llmErrMsg = streamError instanceof Error ? streamError.message : String(streamError);
      providerSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: llmErrMsg,
      });
      providerSpan.recordException(streamError instanceof Error ? streamError : new Error(llmErrMsg));

      if (lfGeneration) {
        lfGeneration.update({
          statusMessage: llmErrMsg,
          level: 'ERROR',
        });
      }

      throw new Error(`LLM call failed: ${llmErrMsg}`);
    } finally {
      providerSpan.end();
    }

    const elapsedMs = Date.now() - startTime;

    // Parse JSON from response
    let parsedOutput: Record<string, unknown> = {};
    let parseError: Error | null = null;
    try {
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedOutput = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (err) {
      parseError = err instanceof Error ? err : new Error(String(err));
      executionLogger.warn({ executionId, err: parseError }, 'Failed to parse model response as JSON');
      await appendExecutionLog(
        executionId,
        userId,
        agentType,
        'WARN',
        'Failed to parse response as JSON. Raw response stored.',
        { rawResponseLength: fullResponse.length }
      );
      parsedOutput = { rawResponse: fullResponse };
    }

    // ── Output Validation Pipeline ────────────────────────────────────────────
    let validationResult = {
      passed: false,
      schemaValid: false,
      semanticValid: false,
      policyValid: false,
      errors: [] as Array<{ layer: string; field?: string; message: string }>,
      normalized: parsedOutput,
    };

    if (!parseError) {
      validationResult = validateAgentOutput(agentType, parsedOutput);

      if (!validationResult.passed) {
        await appendExecutionLog(
          executionId,
          userId,
          agentType,
          'WARN',
          `Output validation failed (${validationResult.errors.length} issue(s))`,
          { errors: validationResult.errors }
        );
      }
    }

    // ── Hallucination Controls ────────────────────────────────────────────────
    if (!parseError) {
      const hallucinationResult = inspectForHallucinations(
        agentType,
        validationResult.passed ? validationResult.normalized : parsedOutput,
        promptContext as Record<string, string>
      );

      if (!hallucinationResult.safe) {
        await appendExecutionLog(
          executionId,
          userId,
          agentType,
          'ERROR',
          `Hallucination risk detected (${hallucinationResult.suspicions.length} issue(s))`,
          { suspicions: hallucinationResult.suspicions }
        );

        const policy = getPolicy(agentType);
        if (policy.blockOnHallucinationRisk) {
          throw new Error(
            `Execution blocked: hallucination risk detected. Issues: ${
              hallucinationResult.suspicions.map((s) => s.evidence).join('; ')
            }`
          );
        }
      } else if (hallucinationResult.suspicions.length > 0) {
        await appendExecutionLog(
          executionId,
          userId,
          agentType,
          'WARN',
          `Low-severity hallucination signals detected (${hallucinationResult.suspicions.length})`,
          { suspicions: hallucinationResult.suspicions }
        );
      }
    }

    // ── Cost estimation ───────────────────────────────────────────────────────
    const costUsd = usedProvider && usedModel
      ? estimateCostUsd(usedProvider, usedModel, inputTokens, outputTokens)
      : undefined;

    // Use normalized output if validation passed, otherwise keep raw parsed
    const finalOutput = validationResult.passed ? validationResult.normalized : parsedOutput;

    // Check if the execution has been cancelled or paused while the LLM was processing
    const currentExecution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      select: { status: true },
    });

    if (currentExecution?.status === 'failed' || currentExecution?.status === 'paused') {
      executionLogger.warn(
        { executionId, status: currentExecution.status },
        'executeAgent: Skipping completion and post-processing because the execution was cancelled or paused'
      );
      return;
    }

    // ── Transition state to completed atomically and log audit
    await transitionExecutionState(executionId, 'completed', {
      actor: 'agent-executor',
      correlationId,
      requestId,
      userId,
    });

    // ── Persist execution result with provenance ──────────────────────────────
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        output: JSON.stringify(finalOutput),
        tokenCount,
        inputTokens,
        outputTokens,
        durationMs: elapsedMs,
        errorMessage: null,
        provider: usedProvider,
        modelId: usedModel,
        costUsd: costUsd ?? null,
        // Validation provenance
        validationPassed: validationResult.passed,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validationErrors: validationResult.errors.length > 0 ? (validationResult.errors as any) : null,
        validationVersion: VALIDATION_VERSION,
        schemaValidated: validationResult.schemaValid,
        semanticValidated: validationResult.semanticValid,
        policyValidated: validationResult.policyValid,
      },
    });

    // ── Post-processing hooks for Role Intelligence & Fit Evaluation ─────────────
    const jobId = (promptContext as any).jobId as string | undefined;
    const candidate = await prisma.candidate.findUnique({
      where: { email: userId },
      select: { id: true },
    });
    const candidateId = candidate?.id;

    if (agentType === 'role-intelligence' && jobId) {
      const data = finalOutput as any;
      const jobIntel = await prisma.jobIntelligence.upsert({
        where: { jobId },
        create: {
          jobId,
          candidateId: candidateId || '',
          inferredRole: data.inferredRoleTitle || '',
          roleArchetype: (data.archetypes?.[0]?.archetype as RoleArchetype) || RoleArchetype.BUILDER,
          archetypeWeights: (data.archetypes ? Object.fromEntries(data.archetypes.map((a: any) => [a.archetype, a.weight])) : {}) as Prisma.InputJsonValue,
          roleClarityScore: (data.overallConfidence ?? 50) / 100,
          hardRequirements: (data.requirements?.filter((r: any) => r.type === 'hard') || []) as Prisma.InputJsonValue,
          softRequirements: (data.requirements?.filter((r: any) => r.type === 'soft') || []) as Prisma.InputJsonValue,
          operationalDomain: data.signals?.find((s: any) => s.type === 'operational_domain')?.description || 'engineering',
          recurringResponsibilities: [] as Prisma.InputJsonValue,
          decisionOwnership: [],
          operationalScope: '',
          executionComplexity: 5,
          organizationalLeverage: 5,
        },
        update: {
          inferredRole: data.inferredRoleTitle || '',
          roleArchetype: (data.archetypes?.[0]?.archetype as RoleArchetype) || RoleArchetype.BUILDER,
          archetypeWeights: (data.archetypes ? Object.fromEntries(data.archetypes.map((a: any) => [a.archetype, a.weight])) : {}) as Prisma.InputJsonValue,
          roleClarityScore: (data.overallConfidence ?? 50) / 100,
          hardRequirements: (data.requirements?.filter((r: any) => r.type === 'hard') || []) as Prisma.InputJsonValue,
          softRequirements: (data.requirements?.filter((r: any) => r.type === 'soft') || []) as Prisma.InputJsonValue,
        },
      });

      await prisma.requirementBreakdown.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.requirements)) {
        const requirementPayloads = data.requirements.map((r: any) => ({
          jobIntelligenceId: jobIntel.id,
          requirement: r.originalText || r.normalizedText || '',
          classification: r.type || 'hard',
          confidenceScore: (r.confidence ?? 100) / 100,
          tools: r.deconstruction?.tools || [],
          decisions: r.deconstruction?.decisions || [],
          outputs: r.deconstruction?.outputs || [],
          metrics: r.deconstruction?.metrics || [],
          ownership: r.deconstruction?.ownership || '',
          operationalComplexity: r.deconstruction?.operationalComplexity === 'high' ? 8 : r.deconstruction?.operationalComplexity === 'medium' ? 5 : 2,
          collaborationSurface: r.deconstruction?.collaborationSurfaceArea || [],
          businessImpact: r.deconstruction?.businessImpact || '',
          executionCadence: r.deconstruction?.executionCadence || '',
          riskLevel: r.deconstruction?.riskLevel === 'HIGH' ? 8 : r.deconstruction?.riskLevel === 'MEDIUM' ? 5 : 2,
        }));
        await prisma.$transaction(
          requirementPayloads.map((p: any) => prisma.requirementBreakdown.create({ data: p }))
        );
      }

      await prisma.businessProblem.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.businessProblems)) {
        await prisma.businessProblem.createMany({
          data: data.businessProblems.map((p: any) => ({
            jobIntelligenceId: jobIntel.id,
            problem: p.problemArea || '',
            category: p.category || 'execution',
            severity: p.severity || 5,
            evidence: p.description || '',
          })),
        });
      }

      await prisma.operationalSignal.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.signals)) {
        await prisma.operationalSignal.createMany({
          data: data.signals.map((s: any) => ({
            jobIntelligenceId: jobIntel.id,
            signal: s.description || '',
            signalType: s.type || 'recurring_responsibility',
            frequency: 1.0,
            weight: 1.0,
            sourceCompanies: [],
          })),
        });
      }
    }

    if ((agentType === 'fit-analysis' || agentType === 'strength-mapper') && jobId && candidateId) {
      const data = finalOutput as any;
      let jobIntel = await prisma.jobIntelligence.findUnique({ where: { jobId } });
      if (!jobIntel) {
        jobIntel = await prisma.jobIntelligence.create({
          data: {
            jobId,
            candidateId,
            inferredRole: 'Inferred Operational Role',
            roleArchetype: RoleArchetype.BUILDER,
            archetypeWeights: {},
            roleClarityScore: 0.5,
            hardRequirements: [],
            softRequirements: [],
            operationalDomain: 'engineering',
            recurringResponsibilities: [],
            decisionOwnership: [],
            operationalScope: '',
            executionComplexity: 5,
            organizationalLeverage: 5,
          },
        });
      }

      // Record fit results cleanly in RoleFitAnalysis history log
      await prisma.roleFitAnalysis.create({
        data: {
          candidateId,
          jobId,
          analysisType: 'fit_analysis',
          results: data as unknown as Prisma.InputJsonValue,
          executionId,
          agentType: 'fit-analysis',
          modelVersion: 'claude-sonnet-4-6',
        },
      });

      await prisma.strengthEvidence.deleteMany({ where: { jobId, candidateId } });
      if (Array.isArray(data.strengths)) {

        for (const s of data.strengths) {
          await prisma.strengthEvidence.create({
            data: {
              candidateId,
              jobId,
              source: 'fit-analysis',
              capability: s.capabilityName,
              measurableOutcome: s.measurableOutcome || '',
              businessImpact: s.businessImpact || '',
              executionContext: s.candidateProof || '',
              employerInterpretation: s.employerInterpretation || '',
              rarityScore: s.priorityLevel === 'HIGH' ? 0.8 : s.priorityLevel === 'MEDIUM' ? 0.5 : 0.2,
              leverageScore: 0.5,
              replacementCost: 0.5,
              businessBottleneckScore: 0.5,
              matchedProblems: s.problemArea ? [s.problemArea] : [],
              matchConfidence: 0.8,
            },
          });
        }
      }
    }

    if (agentType === 'gap-analyzer' && jobId && candidateId) {
      const data = finalOutput as any;
      let jobIntel = await prisma.jobIntelligence.findUnique({ where: { jobId } });
      if (!jobIntel) {
        jobIntel = await prisma.jobIntelligence.create({
          data: {
            jobId,
            candidateId,
            inferredRole: 'Inferred Operational Role',
            roleArchetype: RoleArchetype.BUILDER,
            archetypeWeights: {} as Prisma.InputJsonValue,
            roleClarityScore: 0.5,
            hardRequirements: [] as Prisma.InputJsonValue,
            softRequirements: [] as Prisma.InputJsonValue,
            operationalDomain: 'engineering',
            recurringResponsibilities: [] as Prisma.InputJsonValue,
            decisionOwnership: [],
            operationalScope: '',
            executionComplexity: 5,
            organizationalLeverage: 5,
          },
        });
      }

      await prisma.roleFitAnalysis.create({
        data: {
          candidateId,
          jobId,
          analysisType: 'gap_analysis',
          results: data as unknown as Prisma.InputJsonValue,
          executionId,
          agentType: 'gap-analyzer',
          modelVersion: 'claude-sonnet-4-6',
        },
      });

      await prisma.$transaction(async (tx) => {
        await tx.fitGap.deleteMany({ where: { jobId, candidateId } });
        if (Array.isArray(data.gaps)) {
          await tx.fitGap.createMany({
            data: data.gaps.map((g: any) => ({
              candidateId,
              jobId,
              gap: g.description || '',
              classification: g.type === 'credibility-killing' ? GapClassification.CREDIBILITY_KILLING : g.type === 'domain-depth' ? GapClassification.DOMAIN_DEPTH : GapClassification.TRAINABLE,
              severity: g.severity || 5,
              penaltyMultiplier: g.penaltyLevel === 'CRITICAL' ? 0.5 : g.penaltyLevel === 'SEVERE' ? 0.7 : 0.9,
            })),
          });
        }
      });
    }

    if (agentType === 'conversion-scorer' && jobId && candidateId) {
      const data = finalOutput as any;
      let jobIntel = await prisma.jobIntelligence.findUnique({ where: { jobId } });
      if (!jobIntel) {
        jobIntel = await prisma.jobIntelligence.create({
          data: {
            jobId,
            candidateId,
            inferredRole: 'Inferred Operational Role',
            roleArchetype: RoleArchetype.BUILDER,
            archetypeWeights: {} as Prisma.InputJsonValue,
            roleClarityScore: 0.5,
            hardRequirements: [] as Prisma.InputJsonValue,
            softRequirements: [] as Prisma.InputJsonValue,
            operationalDomain: 'engineering',
            recurringResponsibilities: [] as Prisma.InputJsonValue,
            decisionOwnership: [],
            operationalScope: '',
            executionComplexity: 5,
            organizationalLeverage: 5,
          },
        });
      }

      const { calculateFitScore } = await import('@/lib/scoring/scoringEngine');
      const scoreResult = calculateFitScore({
        dimensions: data.dimensions || [],
        credibilityRiskLevel: data.credibilityRiskLevel || 'NONE',
        adaptationBurdenLevel: data.adaptationBurdenLevel || 'LOW',
        archetypes: [{ archetype: jobIntel.roleArchetype, weight: 1.0 }]
      });

      const getScore = (dim: string) => scoreResult.dimensionDetails.find(d => d.dimension === dim)?.score ?? 0;

      /** Serialize scoreResult to a plain JSON-safe object for Prisma storage */
      function toInputJsonValue(val: unknown): Prisma.InputJsonValue {
        return JSON.parse(JSON.stringify(val)) as Prisma.InputJsonValue;
      }
      function toRecommendation(band: string): string {
        const allowed = ['STRONG_PURSUE', 'PURSUE', 'CONSIDER', 'DEPRIORITIZE', 'SUPPRESS'];
        return allowed.includes(band) ? band : 'CONSIDER';
      }

      await prisma.fitScoringSnapshot.upsert({
        where: { jobId },
        create: {
          candidateId,
          jobId,
          fitScore: scoreResult.finalScore,
          interviewConversionProbability: scoreResult.finalScore,
          immediateContributionScore: getScore('immediateContribution'),
          credibilityRiskScore: data.credibilityRiskLevel === 'NONE' ? 0.0 : data.credibilityRiskLevel === 'LOW' ? 15.0 : data.credibilityRiskLevel === 'MODERATE' ? 35.0 : data.credibilityRiskLevel === 'HIGH' ? 65.0 : 85.0,
          skillTransferScore: getScore('adjacentSkillTransfer'),
          businessProblemAlignmentScore: getScore('businessProblemAlignment'),
          adaptationRiskScore: scoreResult.adaptationMultiplier * 100,
          roleClarityScore: getScore('archetypeAlignment'),
          employerPainMatchScore: getScore('businessProblemAlignment'),
          dimensionScores: toInputJsonValue(scoreResult),
          weights: {} as Prisma.InputJsonValue,
          recommendation: toRecommendation(scoreResult.recommendationBand),
        },
        update: {
          fitScore: scoreResult.finalScore,
          interviewConversionProbability: scoreResult.finalScore,
          immediateContributionScore: getScore('immediateContribution'),
          credibilityRiskScore: data.credibilityRiskLevel === 'NONE' ? 0.0 : data.credibilityRiskLevel === 'LOW' ? 15.0 : data.credibilityRiskLevel === 'MODERATE' ? 35.0 : data.credibilityRiskLevel === 'HIGH' ? 65.0 : 85.0,
          skillTransferScore: getScore('adjacentSkillTransfer'),
          businessProblemAlignmentScore: getScore('businessProblemAlignment'),
          adaptationRiskScore: scoreResult.adaptationMultiplier * 100,
          roleClarityScore: getScore('archetypeAlignment'),
          employerPainMatchScore: getScore('businessProblemAlignment'),
          dimensionScores: toInputJsonValue(scoreResult),
          recommendation: toRecommendation(scoreResult.recommendationBand),
        },
      });
    }

    if (agentType === 'pattern-miner' && candidateId) {
      const data = finalOutput as any;
      if (Array.isArray(data.entries)) {
        for (const entry of data.entries) {
          await prisma.patternLibraryEntry.create({
            data: {
              candidateId,
              archetypeCorrelation: entry.roleArchetype as RoleArchetype || RoleArchetype.BUILDER,
              pattern: entry.pattern || entry.operationalKeywords?.join(', ') || 'Auto-pattern',
              category: PatternCategory.ARCHETYPE_CORRELATION,
              confidenceScore: (entry.successScore ?? 0.0) / 100,
            },
          });
        }
      }
    }

    if (lfTrace) {
      lfTrace.update({
        output: JSON.stringify(finalOutput),
      });
    }

    agentSpan.setStatus({ code: SpanStatusCode.OK });

    await appendExecutionLog(
      executionId,
      userId,
      agentType,
      'INFO',
      'Agent execution completed successfully',
      {
        tokenCount,
        durationMs: elapsedMs,
        validationPassed: validationResult.passed,
        provider: usedProvider,
        model: usedModel,
      }
    );

    await publishAgentCompleted(
      userId,
      executionId,
      agentType,
      'success',
      finalOutput,
      undefined,
      tokenCount,
      elapsedMs
    );
    await publishAgentStatus(
      userId,
      executionId,
      agentType,
      'completed',
      0,
      'Complete',
      tokenCount
    );
    executionLogger.info(
      { ...logContext, tokenCount, durationMs: elapsedMs, validationPassed: validationResult.passed },
      'Agent execution completed'
    );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const failure = classifyError(error, { executionId, agentType, userId, correlationId });

      agentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: errorMessage,
      });
      agentSpan.recordException(error instanceof Error ? error : new Error(errorMessage));

      if (lfGeneration) {
        lfGeneration.update({
          statusMessage: errorMessage,
          level: 'ERROR',
        });
      }
      if (lfTrace) {
        lfTrace.update({
          output: errorMessage,
        });
      }

      executionLogger.error(
        { ...logContext, err: error, failureType: failure.failureType, retryable: failure.retryable },
        'Agent execution failed'
      );

      const currentExecution = await prisma.agentExecution.findUnique({
        where: { id: executionId },
        select: { status: true, errorMessage: true },
      });

      if (currentExecution?.status === 'failed' && currentExecution.errorMessage === 'Execution was cancelled by user') {
        executionLogger.warn(
          { executionId },
          'executeAgent: Skipping failure update because execution was already cancelled by user'
        );
        return;
      }

      // Transition to failed state via state machine
      try {
        await transitionExecutionState(executionId, 'failed', {
          actor: 'agent-executor',
          correlationId,
          requestId,
          userId,
          justification: errorMessage,
        });
      } catch (transErr) {
        executionLogger.error({ executionId, err: transErr }, 'Failed to transition to failed state during crash recovery');
      }

      await prisma.agentExecution.update({
        where: { id: executionId },
        data: {
          errorMessage,
        },
      });

      await appendExecutionLog(
        executionId,
        userId,
        agentType,
        'ERROR',
        `Agent execution failed: ${errorMessage}`,
        {
          failureType: failure.failureType,
          retryable: failure.retryable,
          errorClass: failure.errorClass,
          correlationId,
          requestId,
        }
      );

      await publishAgentCompleted(
        userId,
        executionId,
        agentType,
        'failed',
        undefined,
        errorMessage,
        0,
        Date.now() - executionStartedAt
      );
      await publishAgentStatus(
        userId,
        executionId,
        agentType,
        'failed',
        0,
        'Failed'
      );
    }
  } finally {
    agentSpan.end();
  }
}

const STUCK_EXECUTION_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

async function recoverStuckExecutions(): Promise<number> {
  const stuckBefore = new Date(Date.now() - STUCK_EXECUTION_THRESHOLD_MS);
  const result = await prisma.agentExecution.updateMany({
    where: {
      status: 'running',
      startedAt: { lt: stuckBefore },
    },
    data: {
      status: 'queued',
      startedAt: null,
      errorMessage: 'Automatically reset from stuck running state',
    },
  });

  if (result.count > 0) {
    executionLogger.warn(
      { recoveredCount: result.count },
      'Recovered stuck agent executions back to queued state'
    );
  }

  return result.count;
}

async function claimExecution(id: string): Promise<boolean> {
  try {
    const result = await prisma.$executeRaw`
      UPDATE "AgentExecution"
      SET "status" = 'running', "startedAt" = NOW()
      WHERE "id" = ${id} AND "status" = 'queued'
    `;
    return result > 0;
  } catch (error) {
    executionLogger.error({ err: error, executionId: id }, 'Failed to atomically claim execution');
    return false;
  }
}

// Rate-limiting guard for recoverStuckExecutions to avoid overloading the DB in tight loops
let lastRecoveryCheck = 0;
const RECOVERY_CHECK_INTERVAL_MS = process.env.NODE_ENV === 'test' ? 0 : 2 * 60 * 1000; // run at most once every 2 minutes

export async function processPendingExecutions(): Promise<number> {
  const now = Date.now();
  if (now - lastRecoveryCheck >= RECOVERY_CHECK_INTERVAL_MS) {
    await recoverStuckExecutions();
    lastRecoveryCheck = Date.now();
  }

  const pending = await prisma.agentExecution.findFirst({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
  });

  if (!pending) {
    return 0;
  }

  const running = await prisma.agentExecution.count({
    where: {
      userId: pending.userId,
      status: 'running',
    },
  });

  if (running >= 5) {
    executionLogger.warn(
      { executionId: pending.id, userId: pending.userId },
      'Execution deferred due to legacy concurrency gate'
    );
    return 0;
  }

  const claimed = await claimExecution(pending.id);
  if (!claimed) {
    return 0;
  }

  const promptContext = pending.input
    ? (JSON.parse(pending.input) as AgentPromptContext)
    : {};

  try {
    await executeAgent({
      executionId: pending.id,
      agentType: pending.agentType as AgentType,
      promptContext,
      userId: pending.userId,
    });
    return 1;
  } catch (error) {
    executionLogger.error({ executionId: pending.id, err: error }, 'Failed to process pending execution');
    await prisma.agentExecution.update({
      where: { id: pending.id },
      data: {
        status: 'failed',
        errorMessage:
          error instanceof Error
            ? error.message
            : 'Unknown error occurred',
      },
    });
    return 0;
  }
}



