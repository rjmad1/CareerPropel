/**
 * Core type definitions for the Fit Evaluation Engine.
 * These types model the ~11-dimensional scoring pipeline
 * and the job deconstruction → strength mapping → gap analysis → weighted scoring flow.
 */

import { RoleArchetype, GapClassification, PatternCategory } from '@prisma/client';

export enum FitDimension {
  DEMONSTRATED_EXECUTION_PROOF = 'DEMONSTRATED_EXECUTION_PROOF',
  BUSINESS_PROBLEM_ALIGNMENT = 'BUSINESS_PROBLEM_ALIGNMENT',
  RESPONSIBILITY_OVERLAP = 'RESPONSIBILITY_OVERLAP',
  TOOL_OVERLAP = 'TOOL_OVERLAP',
  KEYWORD_OVERLAP = 'KEYWORD_OVERLAP',
  ADJACENT_SKILL_TRANSFER = 'ADJACENT_SKILL_TRANSFER',
  DOMAIN_FAMILIARITY = 'DOMAIN_FAMILIARITY',
  ARCHETYPE_ALIGNMENT = 'ARCHETYPE_ALIGNMENT',
  IMMEDIATE_CONTRIBUTION_CAPABILITY = 'IMMEDIATE_CONTRIBUTION_CAPABILITY',
  STRATEGIC_IMPACT_ALIGNMENT = 'STRATEGIC_IMPACT_ALIGNMENT',
  CREDIBILITY_RISK = 'CREDIBILITY_RISK',
  ADAPTATION_BURDEN = 'ADAPTATION_BURDEN',
}

// ─── Stage 1: Job Deconstruction Output ──────────────────────────────────────

export interface InferredRole {
  title: string;                    // e.g. "roadmap operator", "delivery manager"
  archetype: RoleArchetype;
  archetypeWeights: Record<RoleArchetype, number>; // distribution across archetypes
  clarityScore: number;             // 0-1 how clearly the real role is defined
  reasoning: string;
}

export interface DeconstructedRequirement {
  requirement: string;
  classification: 'hard' | 'soft' | 'wishlist';
  confidenceScore: number;          // 0-1
  tools: string[];
  decisions: string[];
  outputs: string[];
  metrics: string[];
  ownership: string;
  operationalComplexity: number;    // 1-10
  collaborationSurface: string[];
  businessImpact: string | null;
  executionCadence: string | null;
  riskLevel: number;               // 1-10 hiring risk if missing
}

export interface BusinessProblemInference {
  problem: string;
  category: string;
  severity: number;                 // 1-10
  urgencySignal: string | null;
  operationalFriction: string | null;
  scalingChallenge: string | null;
  executionBottleneck: string | null;
  evidence: string | null;
}

export interface OperationalSignal {
  signal: string;
  signalType: string;
  frequency: number;                // 0-1
  weight: number;                   // 0-1
  sourceCompanies: string[];
}

export interface JobDeconstructionResult {
  inferredRole: InferredRole;
  hardRequirements: DeconstructedRequirement[];
  softRequirements: DeconstructedRequirement[];
  businessProblems: BusinessProblemInference[];
  operationalSignals: OperationalSignal[];
  operationalDomain: string;
  recurringResponsibilities: Array<{
    responsibility: string;
    frequency: number;
    weight: number;
  }>;
  decisionOwnership: string[];
  operationalScope: string;
  executionComplexity: number;      // 1-10
  systemsResponsibility: string | null;
  crossFunctionalCoordination: string | null;
  reportingStructure: {
    reportsTo: string | null;
    manages: string[];
  } | null;
  organizationalLeverage: number;   // 1-10
  rawJdText: string;
}

// ─── Stage 2: Strength Mapping ───────────────────────────────────────────────

export interface MappedStrength {
  capability: string;
  source: string;                    // resume, accomplishment, star_story
  measurableOutcome: string | null;
  businessImpact: string | null;
  executionContext: string | null;
  scale: string | null;
  decisionOwnership: string | null;
  operationalComplexity: number | null;
  systemsInfluenced: string[];
  stakeholderLevel: string | null;
  repeatability: string | null;
  employerInterpretation: string | null;
  economicImpact: string | null;
  operationalLeverage: string | null;
  rarityScore: number;              // 0-1
  leverageScore: number;            // 0-1
  replacementCost: number;         // 0-1
  businessBottleneckScore: number; // 0-1
  matchedProblems: string[];
  matchConfidence: number;         // 0-1
}

export interface StrengthMappingResult {
  strengths: MappedStrength[];
  topStrengths: MappedStrength[];    // top 5 by combined (rarity × leverage)
  totalRarityScore: number;
  totalProofDensity: number;
  strongestCapabilityClusters: string[];
  employerLanguageVersions: Record<string, string>; // { original_capability: employer_interpretation }
}

// ─── Stage 3: Gap Analysis ───────────────────────────────────────────────────

export interface GapAnalysisResult {
  gaps: Array<{
    gap: string;
    classification: GapClassification;
    severity: number;               // 1-10
    penaltyMultiplier: number;      // default 1.0
    adjacentProof: string | null;
    learningTime: string | null;
    learningResources: string[];
    blockingReason: string | null;
    alternativeRoute: string | null;
    domainRequired: string | null;
    adjacentDomain: string | null;
    onboardingComplexity: number | null;
    learningCurve: string | null;
    operationalRampTime: string | null;
  }>;
  credibilityGaps: number;
  trainableGaps: number;
  domainDepthGaps: number;
  adaptationSpeedGaps: number;
  totalPenaltyMultiplier: number;
  adaptationBurden: 'low' | 'medium' | 'high';
}

// ─── Stage 4: Weighted Scoring ──────────────────────────────────────────────

export interface DimensionScore {
  dimension: FitDimension;
  score: number;                    // 0-1
  weight: number;                   // 0-1 (sums to 1 across dimensions)
  contribution: number;            // score × weight
  evidence: string;
  confidence: number;              // 0-1
}

export interface FitScoreResult {
  overallFitScore: number;                         // 0-1
  interviewConversionProbability: number;           // 0-1
  immediateContributionScore: number;               // 0-1
  credibilityRiskScore: number;                     // 0-1 (higher = more risk)
  skillTransferScore: number;                       // 0-1
  businessProblemAlignmentScore: number;            // 0-1
  adaptationRiskScore: number;                      // 0-1 (higher = more risk)
  roleClarityScore: number;                         // 0-1
  employerPainMatchScore: number;                   // 0-1
  dimensionScores: Record<FitDimension, DimensionScore>;
  weights: Record<FitDimension, number>;
  weightsVersion: number;

  strongestLeveragePoints: string[];
  biggestBlockers: string[];
  expectedRecruiterPerception: string;

  recommendation: 'STRONG_PURSUE' | 'PURSUE' | 'CONSIDER' | 'DEPRIORITIZE' | 'SUPPRESS';
  recommendationRationale: string;

  suppressed: boolean;
  suppressionReason: string | null;
}

// ─── Full Analysis Pipeline Result ───────────────────────────────────────────

export interface FullFitAnalysisResult {
  jobDeconstruction: JobDeconstructionResult;
  strengthMapping: StrengthMappingResult;
  gapAnalysis: GapAnalysisResult;
  fitScore: FitScoreResult;
  analyzedAt: string;
  analysisVersion: number;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    costUsd: number;
  };
}

// ─── Pattern Library Entry ──────────────────────────────────────────────────

export interface PatternEntry {
  pattern: string;
  description: string | null;
  category: PatternCategory;
  confidenceScore: number;
  frequencyObserved: number;
  conversionRate: number | null;
  archetypeCorrelation: RoleArchetype | null;
  weightModifier: number;
  evidenceText: string | null;
  metrics: Record<string, unknown> | null;
}
