/**
 * Constants and default weights for the Fit Evaluation Engine.
 * These weights are calibrated — they can be overridden per-user or per-job.
 */

import { FitDimension } from '@prisma/client';

/**
 * Default scoring dimension weights.
 * Sums to 1.0. These are the "standard" weights used when no
 * pattern library overrides exist.
 */
export const DEFAULT_DIMENSION_WEIGHTS: Record<FitDimension, number> = {
  DEMONSTRATED_EXECUTION_PROOF:       0.18,
  BUSINESS_PROBLEM_ALIGNMENT:         0.14,
  RESPONSIBILITY_OVERLAP:             0.13,
  TOOL_OVERLAP:                       0.08,
  KEYWORD_OVERLAP:                    0.07,
  ADJACENT_SKILL_TRANSFER:            0.10,
  DOMAIN_FAMILIARITY:                 0.09,
  ARCHETYPE_ALIGNMENT:                0.08,
  IMMEDIATE_CONTRIBUTION_CAPABILITY:  0.05,
  STRATEGIC_IMPACT_ALIGNMENT:         0.04,
  CREDIBILITY_RISK:                   0.03,
  ADAPTATION_BURDEN:                  0.01,
};

/** Version of the weight schema for cache-busting */
export const WEIGHTS_VERSION = 1;

/**
 * Score thresholds for recommendations.
 */
export const RECOMMENDATION_THRESHOLDS = {
  STRONG_PURSUE:  0.85,  // ≥ 0.85 → strong pursue
  PURSUE:         0.70,  // ≥ 0.70 → pursue
  CONSIDER:       0.50,  // ≥ 0.50 → consider
  DEPRIORITIZE:   0.30,  // ≥ 0.30 → deprioritize
  // < 0.30 → suppress
} as const;

/**
 * Suppression rules — if any of these conditions are met, the job
 * is automatically suppressed (not shown in priorities).
 */
export const SUPPRESSION_RULES = [
  { dimension: 'CREDIBILITY_RISK' as FitDimension, threshold: 0.8, reason: 'High credibility risk — gaps likely to block hiring manager trust' },
  { dimension: 'ADAPTATION_BURDEN' as FitDimension, threshold: 0.8, reason: 'High adaptation burden — ramp time likely exceeds employer patience' },
] as const;

/**
 * Agent type constants for the fit engine agents.
 */
export const FIT_ENGINE_AGENT_TYPES = {
  JOB_DECONSTRUCTION:   'role-deconstruction',
  STRENGTH_MAPPING:     'strength-mapping',
  GAP_ANALYSIS:         'gap-analysis',
  FIT_SCORING:          'fit-scoring',
  PATTERN_EXTRACTION:   'pattern-extraction',
} as const;

/**
 * LLM prompt version tags for fit engine agents.
 */
export const FIT_ENGINE_PROMPT_VERSIONS = {
  JOB_DECONSTRUCTION:   'fit-engine:job-deconstruction:v1',
  STRENGTH_MAPPING:     'fit-engine:strength-mapping:v1',
  GAP_ANALYSIS:         'fit-engine:gap-analysis:v1',
  FIT_SCORING:          'fit-engine:fit-scoring:v1',
  PATTERN_EXTRACTION:   'fit-engine:pattern-extraction:v1',
} as const;

/**
 * Default concurrency limits for fit engine agents.
 */
export const FIT_ENGINE_CONCURRENCY = {
  JOB_DECONSTRUCTION:   3,
  STRENGTH_MAPPING:     3,
  GAP_ANALYSIS:         3,
  FIT_SCORING:          2,
  PATTERN_EXTRACTION:   1,
} as const;

/**
 * Analysis version — bump when changing scoring logic significantly.
 */
export const CURRENT_ANALYSIS_VERSION = 1;

/**
 * Minimum confidence thresholds for accepting analysis results.
 */
export const MIN_CONFIDENCE = {
  REQUIREMENT_CLASSIFICATION: 0.6,
  ARCHETYPE_INFERENCE:        0.5,
  STRENGTH_MATCH:             0.4,
  GAP_CLASSIFICATION:         0.6,
  DIMENSION_SCORE:            0.3,
} as const;

/**
 * Role archetype descriptors for human-readable output.
 */
export const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  BUILDER:                     'Builds new systems, products, or capabilities from scratch',
  OPERATOR:                    'Runs and maintains existing operations efficiently',
  STRATEGIST:                  'Defines direction, strategy, and long-term vision',
  MAINTAINER:                  'Sustains and incrementally improves existing systems',
  OPTIMIZER:                   'Finds efficiency gains and performance improvements',
  RESEARCHER:                  'Investigates, experiments, and discovers new approaches',
  EXECUTOR:                    'Delivers defined outcomes reliably and consistently',
  PROCESS_SCALER:              'Takes processes from ad-hoc to repeatable at scale',
  SYSTEMS_INTEGRATOR:          'Connects disparate systems and creates coherent platforms',
  CUSTOMER_FACING_TRANSLATOR:  'Bridges technical and business domains effectively',
  TECHNICAL_LEAD:              'Guides technical direction and develops teams',
  TRANSFORMATION_DRIVER:       'Leads organizational or technical transformation efforts',
};
