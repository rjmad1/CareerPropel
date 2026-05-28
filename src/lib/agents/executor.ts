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
import {
  AgentType,
  AgentPromptContext,
  getAgentSystemPrompt,
  buildAgentUserPrompt,
} from './prompts';
import {
  publishAgentStarted,
  publishAgentCompleted,
  publishAgentStatus,
} from './redis-integration';
import { appendExecutionLog } from './store';
import { getActivePromptVersion } from '@/lib/governance/promptRegistry';
import { validateAgentOutput, VALIDATION_VERSION } from '@/lib/governance/outputValidator';
import { assertQualified } from '@/lib/governance/providerQualification';
import type { LLMProviderName } from '@/lib/llm/provider';
import { inspectForHallucinations, inspectInputForInjection } from '@/lib/governance/hallucinationControls';
import { checkExecutionPolicy, estimateCostUsd, getPolicy } from '@/lib/governance/policyEngine';

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

  try {
    // Transition to running state
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'running',
        startedAt: new Date(),
      },
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
    const systemPrompt = getAgentSystemPrompt(agentType);
    const userPrompt = buildAgentUserPrompt(agentType, promptContext);
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

      // Assert provider qualification before accepting the result
      assertQualified(agentType, usedProvider, usedModel);
    } catch (streamError) {
      throw new Error(
        `LLM call failed: ${streamError instanceof Error ? streamError.message : String(streamError)}`
      );
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

    // ── Persist execution result with provenance ──────────────────────────────
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        completedAt: new Date(),
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
          inferredRoleTitle: data.inferredRoleTitle,
          overallConfidence: data.overallConfidence ?? 0.0,
        },
        update: {
          inferredRoleTitle: data.inferredRoleTitle,
          overallConfidence: data.overallConfidence ?? 0.0,
        },
      });

      await prisma.roleArchetype.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.archetypes)) {
        await prisma.roleArchetype.createMany({
          data: data.archetypes.map((a: any) => ({
            jobIntelligenceId: jobIntel.id,
            archetype: a.archetype,
            weight: a.weight ?? 0.0,
          })),
        });
      }

      await prisma.requirementBreakdown.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.requirements)) {
        await prisma.requirementBreakdown.createMany({
          data: data.requirements.map((r: any) => ({
            jobIntelligenceId: jobIntel.id,
            type: r.type,
            originalText: r.originalText,
            normalizedText: r.normalizedText,
            confidence: r.confidence ?? 1.0,
            deconstruction: r.deconstruction ?? {},
          })),
        });
      }

      await prisma.businessProblem.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.businessProblems)) {
        await prisma.businessProblem.createMany({
          data: data.businessProblems.map((p: any) => ({
            jobIntelligenceId: jobIntel.id,
            problemArea: p.problemArea,
            description: p.description,
            inferredFriction: p.inferredFriction,
            urgencySignal: p.urgencySignal,
          })),
        });
      }

      await prisma.operationalSignal.deleteMany({ where: { jobIntelligenceId: jobIntel.id } });
      if (Array.isArray(data.signals)) {
        await prisma.operationalSignal.createMany({
          data: data.signals.map((s: any) => ({
            jobIntelligenceId: jobIntel.id,
            type: s.type,
            description: s.description,
            value: s.value,
          })),
        });
      }
    }

    if ((agentType === 'fit-analysis' || agentType === 'strength-mapper') && jobId && candidateId) {
      const data = finalOutput as any;
      let jobIntel = await prisma.jobIntelligence.findUnique({ where: { jobId } });
      if (!jobIntel) {
        jobIntel = await prisma.jobIntelligence.create({
          data: { jobId, inferredRoleTitle: 'Inferred Operational Role', overallConfidence: 50 },
        });
      }

      const analysis = await prisma.roleFitAnalysis.upsert({
        where: {
          candidateId_jobIntelligenceId: {
            candidateId,
            jobIntelligenceId: jobIntel.id,
          },
        },
        create: {
          candidateId,
          jobIntelligenceId: jobIntel.id,
        },
        update: {},
      });

      await prisma.strengthEvidence.deleteMany({ where: { roleFitAnalysisId: analysis.id } });
      if (Array.isArray(data.strengths)) {
        const problems = await prisma.businessProblem.findMany({ where: { jobIntelligenceId: jobIntel.id } });
        const problemMap = new Map(problems.map(p => [p.problemArea.toLowerCase(), p.id]));

        for (const s of data.strengths) {
          const businessProblemId = problemMap.get((s.problemArea || '').toLowerCase()) || null;
          await prisma.strengthEvidence.create({
            data: {
              roleFitAnalysisId: analysis.id,
              businessProblemId,
              capabilityName: s.capabilityName,
              candidateProof: s.candidateProof,
              employerInterpretation: s.employerInterpretation,
              measurableOutcome: s.measurableOutcome,
              businessImpact: s.businessImpact,
              scale: s.scale || null,
              decisionOwnership: s.decisionOwnership || null,
              operationalComplexity: s.operationalComplexity || null,
              systemsInfluenced: s.systemsInfluenced || null,
              stakeholderLevel: s.stakeholderLevel || null,
              repeatability: s.repeatability || null,
              priorityLevel: s.priorityLevel || 'MEDIUM',
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
          data: { jobId, inferredRoleTitle: 'Inferred Operational Role', overallConfidence: 50 },
        });
      }

      const analysis = await prisma.roleFitAnalysis.upsert({
        where: {
          candidateId_jobIntelligenceId: {
            candidateId,
            jobIntelligenceId: jobIntel.id,
          },
        },
        create: {
          candidateId,
          jobIntelligenceId: jobIntel.id,
          adaptationRiskScore: data.adaptationBurdenScore ?? 0.0,
        },
        update: {
          adaptationRiskScore: data.adaptationBurdenScore ?? 0.0,
        },
      });

      await prisma.fitGap.deleteMany({ where: { roleFitAnalysisId: analysis.id } });
      if (Array.isArray(data.gaps)) {
        await prisma.fitGap.createMany({
          data: data.gaps.map((g: any) => ({
            roleFitAnalysisId: analysis.id,
            type: g.type,
            description: g.description,
            penaltyLevel: g.penaltyLevel || 'LOW',
            adaptationCost: g.adaptationCost ?? 0.0,
            mitigationStrategy: g.mitigationStrategy,
          })),
        });
      }
    }

    if (agentType === 'conversion-scorer' && jobId && candidateId) {
      const data = finalOutput as any;
      let jobIntel = await prisma.jobIntelligence.findUnique({ where: { jobId } });
      if (!jobIntel) {
        jobIntel = await prisma.jobIntelligence.create({
          data: { jobId, inferredRoleTitle: 'Inferred Operational Role', overallConfidence: 50 },
        });
      }

      const archetypes = await prisma.roleArchetype.findMany({
        where: { jobIntelligenceId: jobIntel.id },
        select: { archetype: true, weight: true }
      });

      const { calculateFitScore } = await import('@/lib/scoring/scoringEngine');
      const scoreResult = calculateFitScore({
        dimensions: data.dimensions || [],
        credibilityRiskLevel: data.credibilityRiskLevel || 'NONE',
        adaptationBurdenLevel: data.adaptationBurdenLevel || 'LOW',
        archetypes
      });

      const getScore = (dim: string) => scoreResult.dimensionDetails.find(d => d.dimension === dim)?.score ?? 0;

      await prisma.roleFitAnalysis.upsert({
        where: {
          candidateId_jobIntelligenceId: {
            candidateId,
            jobIntelligenceId: jobIntel.id,
          },
        },
        create: {
          candidateId,
          jobIntelligenceId: jobIntel.id,
          overallFitScore: scoreResult.finalScore,
          conversionProb: scoreResult.finalScore,
          immediateContribution: getScore('immediateContribution'),
          credibilityRisk: data.credibilityRiskLevel === 'NONE' ? 0.0 : data.credibilityRiskLevel === 'LOW' ? 15.0 : data.credibilityRiskLevel === 'MODERATE' ? 35.0 : data.credibilityRiskLevel === 'HIGH' ? 65.0 : 85.0,
          skillTransferScore: getScore('adjacentSkillTransfer'),
          businessProbAlign: getScore('businessProblemAlignment'),
          roleClarityScore: getScore('archetypeAlignment'),
          painMatchScore: getScore('businessProblemAlignment'),
          adaptationRiskScore: scoreResult.adaptationMultiplier * 100,
          scoringSnapshot: scoreResult as any,
          reasoning: scoreResult.recommendationBand + ': ' + data.reasoning,
        },
        update: {
          overallFitScore: scoreResult.finalScore,
          conversionProb: scoreResult.finalScore,
          immediateContribution: getScore('immediateContribution'),
          credibilityRisk: data.credibilityRiskLevel === 'NONE' ? 0.0 : data.credibilityRiskLevel === 'LOW' ? 15.0 : data.credibilityRiskLevel === 'MODERATE' ? 35.0 : data.credibilityRiskLevel === 'HIGH' ? 65.0 : 85.0,
          skillTransferScore: getScore('adjacentSkillTransfer'),
          businessProbAlign: getScore('businessProblemAlignment'),
          roleClarityScore: getScore('archetypeAlignment'),
          painMatchScore: getScore('businessProblemAlignment'),
          adaptationRiskScore: scoreResult.adaptationMultiplier * 100,
          scoringSnapshot: scoreResult as any,
          reasoning: scoreResult.recommendationBand + ': ' + data.reasoning,
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
              roleArchetype: entry.roleArchetype,
              operationalKeywords: entry.operationalKeywords ?? [],
              businessProblems: entry.businessProblems ?? [],
              successMetrics: entry.successMetrics ?? [],
              languagePatterns: entry.languagePatterns ?? [],
              achievementsMapped: entry.achievementsMapped ?? [],
              successScore: entry.successScore ?? 0.0,
            },
          });
        }
      }
    }

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

    executionLogger.error(
      { ...logContext, err: error, failureType: failure.failureType, retryable: failure.retryable },
      'Agent execution failed'
    );

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        completedAt: new Date(),
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
}

/**
 * Find and execute pending agent executions (called by background polling)
 * Returns number of executions processed
 */
export async function processPendingExecutions(): Promise<number> {
  const pending = await prisma.agentExecution.findMany({
    where: { status: 'queued' },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });

  let processed = 0;

  for (const execution of pending) {
    try {
      const running = await prisma.agentExecution.count({
        where: {
          userId: execution.userId,
          status: 'running',
        },
      });

      if (running >= 5) {
        executionLogger.warn(
          { executionId: execution.id, userId: execution.userId },
          'Execution deferred due to legacy concurrency gate'
        );
        continue;
      }

      const promptContext = execution.input
        ? (JSON.parse(execution.input) as AgentPromptContext)
        : {};

      await executeAgent({
        executionId: execution.id,
        agentType: execution.agentType as AgentType,
        promptContext,
        userId: execution.userId,
      });

      processed++;
    } catch (error) {
      executionLogger.error({ executionId: execution.id, err: error }, 'Failed to process pending execution');
      await prisma.agentExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unknown error occurred',
        },
      });
    }
  }

  return processed;
}
