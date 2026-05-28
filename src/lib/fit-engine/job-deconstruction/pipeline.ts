/**
 * Job Deconstruction Pipeline
 * Stage 1 of the Fit Evaluation Engine.
 *
 * Takes a raw job description and:
 *  1. Infers the real role (stripping recruiter title bias)
 *  2. Classifies requirements (hard/soft/wishlist)
 *  3. Infers employer business problems
 *  4. Extracts operational signals
 *  5. Determines organizational context
 *
 * The result is a structured JobDeconstructionResult that serves as input
 * to strength mapping, gap analysis, and scoring.
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
import type { JobDeconstructionResult, InferredRole, DeconstructedRequirement, BusinessProblemInference, OperationalSignal } from '@/lib/fit-engine/types';
import { FIT_ENGINE_PROMPT_VERSIONS, CURRENT_ANALYSIS_VERSION } from '@/lib/fit-engine/constants';
import { buildDeconstructionPrompt } from './prompts';
import { parseDeconstructionResponse, validateDeconstructionResult } from './validation';

const logger = createLogger({ component: 'fit-engine:job-deconstruction' });

export interface DeconstructionInput {
  jobId: string;
  candidateId: string;
  jobTitle: string;
  company: string;
  rawJdText: string;
  userId: string;
  correlationId?: string;
}

export interface DeconstructionOutput {
  result: JobDeconstructionResult;
  executionId: string;
  tokenUsage: { inputTokens: number; outputTokens: number; costUsd: number };
}

/**
 * Execute the full job deconstruction pipeline.
 * Creates an AgentExecution record, calls the LLM, persists results,
 * and returns the structured deconstruction.
 */
export async function deconstructJob(input: DeconstructionInput): Promise<DeconstructionOutput> {
  const { jobId, candidateId, jobTitle, company, rawJdText, userId, correlationId } = input;
  const logContext = { jobId, candidateId, userId, correlationId };

  logger.info(logContext, 'Starting job deconstruction');

  // 1. Create agent execution record
  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType: 'role-deconstruction',
      status: 'running',
      input: JSON.stringify({ jobId, jobTitle, company, rawJdText }),
      startedAt: new Date(),
      correlationId,
    },
  });

  try {
    // 2. Build prompt & call LLM
    const prompt = buildDeconstructionPrompt({ jobTitle, company, rawJdText });
    const systemPrompt = `You are a job deconstruction analyst. Your job is to read job descriptions and extract the operational reality behind the recruiter language. Ignore inflated titles. Focus on what the person in this role would actually DO day-to-day.`;

    const llmResult = await callLLM(
      [{ role: 'user', content: prompt }],
      { systemPrompt, temperature: 0.3, maxTokens: 4096 }
    );

    // 3. Parse and validate LLM output
    const parsed = parseDeconstructionResponse(llmResult.content);

    // 4. Persist to database
    await persistDeconstruction({
      jobId,
      candidateId,
      result: parsed,
      executionId: execution.id,
    });

    // 5. Update execution record
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify(parsed),
        tokenCount: llmResult.totalTokens,
        inputTokens: llmResult.inputTokens,
        outputTokens: llmResult.outputTokens,
        durationMs: Date.now() - execution.startedAt!.getTime(),
      },
    });

    logger.info({ ...logContext, inferredRole: parsed.inferredRole.title }, 'Job deconstruction completed');

    return {
      result: parsed,
      executionId: execution.id,
      tokenUsage: {
        inputTokens: llmResult.inputTokens,
        outputTokens: llmResult.outputTokens,
        costUsd: estimateCost(llmResult.inputTokens, llmResult.outputTokens),
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ ...logContext, err: errorMessage }, 'Job deconstruction failed');

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage,
      },
    });

    throw error;
  }
}

/**
 * Persist deconstruction results to the database.
 */
async function persistDeconstruction(opts: {
  jobId: string;
  candidateId: string;
  result: JobDeconstructionResult;
  executionId: string;
}) {
  const { jobId, candidateId, result } = opts;

  // Create or update JobIntelligence
  const intelligence = await prisma.jobIntelligence.upsert({
    where: { jobId },
    create: {
      jobId,
      candidateId,
      inferredRole: result.inferredRole.title,
      roleArchetype: result.inferredRole.archetype,
      archetypeWeights: result.inferredRole.archetypeWeights,
      roleClarityScore: result.inferredRole.clarityScore,
      hardRequirements: result.hardRequirements,
      softRequirements: result.softRequirements,
      operationalDomain: result.operationalDomain,
      recurringResponsibilities: result.recurringResponsibilities,
      decisionOwnership: result.decisionOwnership,
      operationalScope: result.operationalScope,
      executionComplexity: result.executionComplexity,
      systemsResponsibility: result.systemsResponsibility,
      crossFunctionalCoordination: result.crossFunctionalCoordination,
      reportingStructure: result.reportingStructure,
      organizationalLeverage: result.organizationalLeverage,
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      analyzedAt: new Date(),
    },
    update: {
      inferredRole: result.inferredRole.title,
      roleArchetype: result.inferredRole.archetype,
      archetypeWeights: result.inferredRole.archetypeWeights,
      roleClarityScore: result.inferredRole.clarityScore,
      hardRequirements: result.hardRequirements,
      softRequirements: result.softRequirements,
      operationalDomain: result.operationalDomain,
      recurringResponsibilities: result.recurringResponsibilities,
      decisionOwnership: result.decisionOwnership,
      operationalScope: result.operationalScope,
      executionComplexity: result.executionComplexity,
      systemsResponsibility: result.systemsResponsibility,
      crossFunctionalCoordination: result.crossFunctionalCoordination,
      reportingStructure: result.reportingStructure,
      organizationalLeverage: result.organizationalLeverage,
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      analyzedAt: new Date(),
    },
  });

  // Replace requirement breakdowns
  await prisma.requirementBreakdown.deleteMany({
    where: { jobIntelligenceId: intelligence.id },
  });

  for (const req of [...result.hardRequirements, ...result.softRequirements]) {
    await prisma.requirementBreakdown.create({
      data: {
        jobIntelligenceId: intelligence.id,
        requirement: req.requirement,
        classification: req.classification,
        confidenceScore: req.confidenceScore,
        tools: req.tools,
        decisions: req.decisions,
        outputs: req.outputs,
        metrics: req.metrics,
        ownership: req.ownership,
        operationalComplexity: req.operationalComplexity,
        collaborationSurface: req.collaborationSurface,
        businessImpact: req.businessImpact,
        executionCadence: req.executionCadence,
        riskLevel: req.riskLevel,
      },
    });
  }

  // Replace business problems
  await prisma.businessProblem.deleteMany({
    where: { jobIntelligenceId: intelligence.id },
  });

  for (const bp of result.businessProblems) {
    await prisma.businessProblem.create({
      data: {
        jobIntelligenceId: intelligence.id,
        problem: bp.problem,
        category: bp.category,
        severity: bp.severity,
        urgencySignal: bp.urgencySignal,
        operationalFriction: bp.operationalFriction,
        scalingChallenge: bp.scalingChallenge,
        executionBottleneck: bp.executionBottleneck,
        evidence: bp.evidence,
      },
    });
  }

  // Replace operational signals
  await prisma.operationalSignal.deleteMany({
    where: { jobIntelligenceId: intelligence.id },
  });

  for (const sig of result.operationalSignals) {
    await prisma.operationalSignal.create({
      data: {
        jobIntelligenceId: intelligence.id,
        signal: sig.signal,
        signalType: sig.signalType,
        frequency: sig.frequency,
        weight: sig.weight,
        sourceCompanies: sig.sourceCompanies,
      },
    });
  }

  // Record analysis run
  await prisma.roleFitAnalysis.create({
    data: {
      candidateId,
      jobId,
      analysisType: 'role_intelligence',
      results: result as unknown as Record<string, unknown>,
      executionId: opts.executionId,
      agentType: 'role-deconstruction',
      modelVersion: 'claude-sonnet-4-6',
    },
  });
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  // claude-sonnet-4-6 pricing: $3/M input, $15/M output
  return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15;
}
