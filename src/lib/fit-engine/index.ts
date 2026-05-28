/**
 * Fit Evaluation Engine — barrel exports.
 *
 * The engine runs a 4-stage pipeline to evaluate how well a candidate's
 * proven capabilities align with a specific job's operational reality.
 *
 * Stage 1 — Job Deconstruction:      Strip title bias, infer real role, classify requirements
 * Stage 2 — Strength Mapping:         Map candidate evidence to employer needs
 * Stage 3 — Gap Analysis:             Identify and classify capability gaps
 * Stage 4 — Weighted Scoring:         11-dimension fit score with recommendation
 *
 * Usage:
 *   import { runFullAnalysis } from '@/lib/fit-engine';
 *   const { result, stages } = await runFullAnalysis({ ... });
 */

// ─── Pipeline Orchestrator ───────────────────────────────────────────────────

export { runFullAnalysis, runPartialAnalysis } from './agents/orchestrator';
export type { FullAnalysisInput, StageResult } from './agents/orchestrator';

// ─── Stage 1: Job Deconstruction ─────────────────────────────────────────────

export { deconstructJob } from './job-deconstruction/pipeline';
export type { DeconstructionInput, DeconstructionOutput } from './job-deconstruction/pipeline';

// ─── Stage 2: Strength Mapping ───────────────────────────────────────────────

export { mapStrengths } from './strength-mapping/pipeline';
export type { StrengthMappingInput, StrengthMappingOutput } from './strength-mapping/pipeline';

// ─── Stage 3: Gap Analysis ───────────────────────────────────────────────────

export { analyzeGaps } from './gap-analysis/pipeline';
export type { GapAnalysisInput, GapAnalysisOutput } from './gap-analysis/pipeline';

// ─── Stage 4: Fit Scoring ────────────────────────────────────────────────────

export { scoreFit } from './scoring/pipeline';
export type { ScoringInput, ScoringOutput } from './scoring/pipeline';

// ─── Types ───────────────────────────────────────────────────────────────────

export type {
  JobDeconstructionResult,
  InferredRole,
  DeconstructedRequirement,
  BusinessProblemInference,
  OperationalSignal,
  MappedStrength,
  StrengthMappingResult,
  GapAnalysisResult,
  FitScoreResult,
  DimensionScore,
  FullFitAnalysisResult,
  PatternEntry,
} from './types';

// ─── Constants ────────────────────────────────────────────────────────────────

export {
  DEFAULT_DIMENSION_WEIGHTS,
  RECOMMENDATION_THRESHOLDS,
  SUPPRESSION_RULES,
  FIT_ENGINE_AGENT_TYPES,
  FIT_ENGINE_PROMPT_VERSIONS,
  CURRENT_ANALYSIS_VERSION,
  ARCHETYPE_DESCRIPTIONS,
} from './constants';

// ─── Hooks ───────────────────────────────────────────────────────────────────

export {
  useFitScores,
  useFitScore,
  useFitDeconstruction,
  useRunFitAnalysis,
  useReanalyzeFit,
} from './hooks/useFitAnalysis';

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export {
  AnalyzeRequestSchema,
  ReanalyzeRequestSchema,
  ScoresQuerySchema,
} from './schemas/analysis.schema';
export type {
  AnalyzeRequest,
  ReanalyzeRequest,
  ScoresQuery,
} from './schemas/analysis.schema';
