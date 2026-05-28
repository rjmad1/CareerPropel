/**
 * Fit Evaluation Engine Orchestrator
 *
 * Runs the full 4-stage pipeline:
 *  1. Job Deconstruction (LLM → persisted)
 *  2. Strength Mapping (LLM → persisted)
 *  3. Gap Analysis (LLM → persisted)
 *  4. Weighted Scoring (LLM + weights → persisted)
 *
 * Each stage feeds into the next. Can be run as a complete pipeline
 * or individual stages for re-analysis.
 */

import { createLogger } from '@/lib/logging/logger';
import type { FullFitAnalysisResult } from '@/lib/fit-engine/types';
import type { DeconstructionInput } from '@/lib/fit-engine/job-deconstruction/pipeline';
import { deconstructJob } from '@/lib/fit-engine/job-deconstruction/pipeline';
import type { StrengthMappingInput } from '@/lib/fit-engine/strength-mapping/pipeline';
import { mapStrengths } from '@/lib/fit-engine/strength-mapping/pipeline';
import type { GapAnalysisInput } from '@/lib/fit-engine/gap-analysis/pipeline';
import { analyzeGaps } from '@/lib/fit-engine/gap-analysis/pipeline';
import type { ScoringInput } from '@/lib/fit-engine/scoring/pipeline';
import { scoreFit } from '@/lib/fit-engine/scoring/pipeline';
import { CURRENT_ANALYSIS_VERSION } from '@/lib/fit-engine/constants';

const logger = createLogger({ component: 'fit-engine:orchestrator' });

export interface FullAnalysisInput {
  // Required
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  rawJdText: string;
  userId: string;

  // Evidence sources
  resumeContent: string;
  accomplishments: Array<{
    title: string;
    description: string;
    metrics: string | null;
    starContext: string | null;
    category: string;
  }>;
  starStories: Array<{
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }>;

  // Optional overrides
  customWeights?: Partial<Record<string, number>>;
  correlationId?: string;
}

export interface StageResult {
  stage: string;
  status: 'completed' | 'failed';
  executionId: string;
  error?: string;
  durationMs: number;
}

/**
 * Run the full 4-stage fit evaluation pipeline.
 * Each stage is sequential because later stages depend on earlier ones.
 */
export async function runFullAnalysis(input: FullAnalysisInput): Promise<{
  result: FullFitAnalysisResult;
  stages: StageResult[];
}> {
  const { candidateId, jobId, userId, correlationId } = input;
  const runId = correlationId || `fit-${jobId}-${Date.now()}`;
  const stages: StageResult[] = [];
  const startTime = Date.now();

  logger.info({ jobId, candidateId, runId }, 'Starting full fit evaluation pipeline');

  // ─── Stage 1: Job Deconstruction ───────────────────────────────────────
  const stage1Start = Date.now();
  logger.info({ stage: 'deconstruction', runId }, 'Stage 1: Job deconstruction');

  const dInput: DeconstructionInput = {
    jobId, candidateId,
    jobTitle: input.jobTitle,
    company: input.company,
    rawJdText: input.rawJdText,
    userId, correlationId: runId,
  };

  let deconstructionResult, deconstructTokens = { inputTokens: 0, outputTokens: 0, costUsd: 0 };
  try {
    const stage1 = await deconstructJob(dInput);
    deconstructionResult = stage1.result;
    deconstructTokens = stage1.tokenUsage;
    stages.push({ stage: 'deconstruction', status: 'completed', executionId: stage1.executionId, durationMs: Date.now() - stage1Start });
  } catch (error) {
    stages.push({ stage: 'deconstruction', status: 'failed', executionId: '', error: String(error), durationMs: Date.now() - stage1Start });
    throw new Error(`Pipeline failed at Stage 1 (Deconstruction): ${error}`);
  }

  // ─── Stage 2: Strength Mapping ─────────────────────────────────────────
  const stage2Start = Date.now();
  logger.info({ stage: 'strength-mapping', runId }, 'Stage 2: Strength mapping');

  let strengthResult;
  try {
    const sInput: StrengthMappingInput = {
      candidateId, jobId, userId,
      deconstruction: deconstructionResult,
      resumeContent: input.resumeContent,
      accomplishments: input.accomplishments,
      starStories: input.starStories,
      correlationId: runId,
    };
    const stage2 = await mapStrengths(sInput);
    strengthResult = stage2.result;
    stages.push({ stage: 'strength-mapping', status: 'completed', executionId: stage2.executionId, durationMs: Date.now() - stage2Start });
  } catch (error) {
    stages.push({ stage: 'strength-mapping', status: 'failed', executionId: '', error: String(error), durationMs: Date.now() - stage2Start });
    throw new Error(`Pipeline failed at Stage 2 (Strength Mapping): ${error}`);
  }

  // ─── Stage 3: Gap Analysis ──────────────────────────────────────────────
  const stage3Start = Date.now();
  logger.info({ stage: 'gap-analysis', runId }, 'Stage 3: Gap analysis');

  let gapResult;
  try {
    const gInput: GapAnalysisInput = {
      candidateId, jobId, userId,
      deconstruction: deconstructionResult,
      strengths: strengthResult.strengths,
      correlationId: runId,
    };
    const stage3 = await analyzeGaps(gInput);
    gapResult = stage3.result;
    stages.push({ stage: 'gap-analysis', status: 'completed', executionId: stage3.executionId, durationMs: Date.now() - stage3Start });
  } catch (error) {
    stages.push({ stage: 'gap-analysis', status: 'failed', executionId: '', error: String(error), durationMs: Date.now() - stage3Start });
    throw new Error(`Pipeline failed at Stage 3 (Gap Analysis): ${error}`);
  }

  // ─── Stage 4: Fit Scoring ───────────────────────────────────────────────
  const stage4Start = Date.now();
  logger.info({ stage: 'fit-scoring', runId }, 'Stage 4: Fit scoring');

  let scoringResult;
  try {
    const scInput: ScoringInput = {
      candidateId, jobId, userId,
      deconstruction: deconstructionResult,
      strengths: strengthResult,
      gaps: gapResult,
      customWeights: input.customWeights,
      correlationId: runId,
    };
    const stage4 = await scoreFit(scInput);
    scoringResult = stage4.result;
    stages.push({ stage: 'fit-scoring', status: 'completed', executionId: stage4.executionId, durationMs: Date.now() - stage4Start });
  } catch (error) {
    stages.push({ stage: 'fit-scoring', status: 'failed', executionId: '', error: String(error), durationMs: Date.now() - stage4Start });
    throw new Error(`Pipeline failed at Stage 4 (Fit Scoring): ${error}`);
  }

  const totalDurationMs = Date.now() - startTime;

  logger.info({
    jobId, runId,
    fitScore: scoringResult.overallFitScore,
    recommendation: scoringResult.recommendation,
    totalDurationMs,
    stagesCompleted: stages.length,
  }, 'Full fit evaluation pipeline completed');

  return {
    result: {
      jobDeconstruction: deconstructionResult,
      strengthMapping: strengthResult,
      gapAnalysis: gapResult,
      fitScore: scoringResult,
      analyzedAt: new Date().toISOString(),
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      tokenUsage: {
        inputTokens: deconstructTokens.inputTokens,
        outputTokens: deconstructTokens.outputTokens,
        costUsd: deconstructTokens.costUsd,
      },
    },
    stages,
  };
}

/**
 * Run only a subset of stages (for re-analysis or partial runs).
 */
export async function runPartialAnalysis(
  input: FullAnalysisInput,
  stagesToRun: Array<'deconstruction' | 'strength-mapping' | 'gap-analysis' | 'fit-scoring'>
): Promise<{
  result: Partial<FullFitAnalysisResult>;
  stages: StageResult[];
}> {
  const stages: StageResult[] = [];
  const partialResult: Partial<FullFitAnalysisResult> = {};

  const common = { candidateId: input.candidateId, jobId: input.jobId, userId: input.userId, correlationId: input.correlationId };

  for (const stage of stagesToRun) {
    const stageStart = Date.now();
    switch (stage) {
      case 'deconstruction': {
        const r = await deconstructJob({ ...common, jobTitle: input.jobTitle, company: input.company, rawJdText: input.rawJdText });
        partialResult.jobDeconstruction = r.result;
        stages.push({ stage, status: 'completed', executionId: r.executionId, durationMs: Date.now() - stageStart });
        break;
      }
      case 'strength-mapping': {
        if (!partialResult.jobDeconstruction) throw new Error('Deconstruction required before strength mapping');
        const r = await mapStrengths({
          ...common,
          deconstruction: partialResult.jobDeconstruction,
          resumeContent: input.resumeContent,
          accomplishments: input.accomplishments,
          starStories: input.starStories,
        });
        partialResult.strengthMapping = r.result;
        stages.push({ stage, status: 'completed', executionId: r.executionId, durationMs: Date.now() - stageStart });
        break;
      }
      case 'gap-analysis': {
        if (!partialResult.jobDeconstruction || !partialResult.strengthMapping) throw new Error('Deconstruction and strength mapping required before gap analysis');
        const r = await analyzeGaps({
          ...common,
          deconstruction: partialResult.jobDeconstruction,
          strengths: partialResult.strengthMapping.strengths,
        });
        partialResult.gapAnalysis = r.result;
        stages.push({ stage, status: 'completed', executionId: r.executionId, durationMs: Date.now() - stageStart });
        break;
      }
      case 'fit-scoring': {
        if (!partialResult.jobDeconstruction || !partialResult.strengthMapping || !partialResult.gapAnalysis) {
          throw new Error('All prior stages required before fit scoring');
        }
        const r = await scoreFit({
          ...common,
          deconstruction: partialResult.jobDeconstruction,
          strengths: partialResult.strengthMapping,
          gaps: partialResult.gapAnalysis,
          customWeights: input.customWeights,
        });
        partialResult.fitScore = r.result;
        stages.push({ stage, status: 'completed', executionId: r.executionId, durationMs: Date.now() - stageStart });
        break;
      }
    }
  }

  return { result: partialResult, stages };
}
