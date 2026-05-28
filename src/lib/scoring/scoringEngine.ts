/**
 * Canonical Role Intelligence Scoring Engine
 * Deterministic, reproducible, inspectable, and auditable scoring.
 */

export interface DimensionEvaluation {
  dimension: 'executionProof' | 'businessProblemAlignment' | 'responsibilityOverlap' | 'immediateContribution' | 'domainFamiliarity' | 'archetypeAlignment' | 'adjacentSkillTransfer' | 'strategicImpact' | 'toolOverlap' | 'keywordOverlap';
  score: number;       // 0 - 100
  confidence: number;  // 0 - 100
  evidence: string[];
  reasoning: string;
}

export type CredibilityRiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'FRAUDULENT';
export type AdaptationBurdenLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';

export interface ScoringInput {
  dimensions: DimensionEvaluation[];
  credibilityRiskLevel: CredibilityRiskLevel;
  adaptationBurdenLevel: AdaptationBurdenLevel;
  archetypes: Array<{ archetype: string; weight: number }>;
}

export interface ScoringResult {
  baseScore: number;
  finalScore: number;
  credibilityMultiplier: number;
  adaptationMultiplier: number;
  isAutoRejected: boolean;
  recommendationBand: 'High Probability Fit' | 'Strong Stretch Fit' | 'Conditional Fit' | 'Weak Alignment' | 'Misaligned';
  blendedWeights: Record<string, number>;
  dimensionDetails: Array<{
    dimension: string;
    score: number;
    confidence: number;
    weightedContribution: number;
    evidence: string[];
    reasoning: string;
  }>;
}

// ─── Multipliers ──────────────────────────────────────────────────────────────

export const CREDIBILITY_MULTIPLIERS: Record<CredibilityRiskLevel, number> = {
  NONE: 1.00,
  LOW: 0.95,
  MODERATE: 0.85,
  HIGH: 0.55,
  EXTREME: 0.25,
  FRAUDULENT: 0.00, // Triggers AUTO_REJECT
};

export const ADAPTATION_MULTIPLIERS: Record<AdaptationBurdenLevel, number> = {
  LOW: 1.00,
  MODERATE: 0.90,
  HIGH: 0.70,
  EXTREME: 0.40,
};

// ─── Archetype Weight Profiles ────────────────────────────────────────────────

export const ARCHETYPE_WEIGHT_PROFILES: Record<string, Record<string, number>> = {
  'Engineering IC': {
    executionProof: 35,
    businessProblemAlignment: 15,
    responsibilityOverlap: 25,
    immediateContribution: 20,
    domainFamiliarity: 15,
    archetypeAlignment: 15,
    adjacentSkillTransfer: 10,
    strategicImpact: 5,
    toolOverlap: 15,
    keywordOverlap: 2,
  },
  'Product Leadership': {
    executionProof: 25,
    businessProblemAlignment: 30,
    responsibilityOverlap: 15,
    immediateContribution: 15,
    domainFamiliarity: 20,
    archetypeAlignment: 20,
    adjacentSkillTransfer: 10,
    strategicImpact: 25,
    toolOverlap: 2,
    keywordOverlap: 1,
  },
  'Operations Leadership': {
    executionProof: 35,
    businessProblemAlignment: 30,
    responsibilityOverlap: 15,
    immediateContribution: 20,
    domainFamiliarity: 15,
    archetypeAlignment: 20,
    adjacentSkillTransfer: 10,
    strategicImpact: 15,
    toolOverlap: 2,
    keywordOverlap: 1,
  },
  'Data Science': {
    executionProof: 30,
    businessProblemAlignment: 20,
    responsibilityOverlap: 20,
    immediateContribution: 15,
    domainFamiliarity: 15,
    archetypeAlignment: 15,
    adjacentSkillTransfer: 10,
    strategicImpact: 10,
    toolOverlap: 20,
    keywordOverlap: 2,
  },
  'Platform / Infrastructure': {
    executionProof: 35,
    businessProblemAlignment: 20,
    responsibilityOverlap: 25,
    immediateContribution: 20,
    domainFamiliarity: 15,
    archetypeAlignment: 15,
    adjacentSkillTransfer: 10,
    strategicImpact: 5,
    toolOverlap: 20,
    keywordOverlap: 2,
  },
  'Default': {
    executionProof: 30,
    businessProblemAlignment: 25,
    responsibilityOverlap: 20,
    immediateContribution: 20,
    domainFamiliarity: 15,
    archetypeAlignment: 15,
    adjacentSkillTransfer: 10,
    strategicImpact: 10,
    toolOverlap: 5,
    keywordOverlap: 2,
  },
};

// Map the 12 phase 1 archetypes to 5 scoring categories
export function getCategoryForArchetype(archName: string): string {
  const map: Record<string, string> = {
    Builder: 'Engineering IC',
    Executor: 'Engineering IC',
    Operator: 'Operations Leadership',
    'Process Scaler': 'Operations Leadership',
    Strategist: 'Product Leadership',
    'Transformation Driver': 'Product Leadership',
    'Technical Lead': 'Platform / Infrastructure',
    'Systems Integrator': 'Platform / Infrastructure',
    Researcher: 'Data Science',
  };
  return map[archName] || 'Default';
}

/**
 * Calculates a highly reproducible, explainable, and versioned fit score.
 */
export function calculateFitScore(input: ScoringInput): ScoringResult {
  const { dimensions, credibilityRiskLevel, adaptationBurdenLevel, archetypes = [] } = input;

  // 1. Resolve blended weight profile
  const blendedWeights: Record<string, number> = {
    executionProof: 0,
    businessProblemAlignment: 0,
    responsibilityOverlap: 0,
    immediateContribution: 0,
    domainFamiliarity: 0,
    archetypeAlignment: 0,
    adjacentSkillTransfer: 0,
    strategicImpact: 0,
    toolOverlap: 0,
    keywordOverlap: 0,
  };

  let totalArchetypeWeight = 0;
  for (const arch of archetypes) {
    const category = getCategoryForArchetype(arch.archetype);
    const profile = ARCHETYPE_WEIGHT_PROFILES[category] || ARCHETYPE_WEIGHT_PROFILES['Default'];
    totalArchetypeWeight += arch.weight;

    for (const key of Object.keys(blendedWeights)) {
      blendedWeights[key] += (profile[key] ?? 0) * arch.weight;
    }
  }

  // Fallback if no archetypes or sum to 0
  if (totalArchetypeWeight === 0) {
    const defaultProfile = ARCHETYPE_WEIGHT_PROFILES['Default'];
    for (const key of Object.keys(blendedWeights)) {
      blendedWeights[key] = defaultProfile[key];
    }
  } else {
    // Normalize blended weights back to a standard sum scale if needed, or keep raw blended
    for (const key of Object.keys(blendedWeights)) {
      blendedWeights[key] = parseFloat((blendedWeights[key] / totalArchetypeWeight).toFixed(3));
    }
  }

  // 2. Additive weighted scoring
  let weightedScoreSum = 0;
  let totalWeight = 0;
  const dimensionDetails: ScoringResult['dimensionDetails'] = [];

  for (const key of Object.keys(blendedWeights)) {
    const weight = blendedWeights[key];
    totalWeight += weight;

    // Find candidate score for this dimension
    const dimEval = dimensions.find(d => d.dimension === key);
    const rawScore = dimEval ? dimEval.score : 0;
    const confidence = dimEval ? dimEval.confidence : 0;
    
    // Confidence-weighted normalization: suppress aggressive scores if confidence is low
    // If confidence is < 60, scale down the effective score slightly
    let effectiveScore = rawScore;
    if (confidence < 60) {
      effectiveScore = rawScore * (confidence / 100);
    }

    weightedScoreSum += effectiveScore * weight;

    dimensionDetails.push({
      dimension: key,
      score: rawScore,
      confidence,
      weightedContribution: parseFloat((effectiveScore * (weight / totalWeight)).toFixed(3)),
      evidence: dimEval?.evidence ?? [],
      reasoning: dimEval?.reasoning ?? 'No evaluation evidence provided.',
    });
  }

  const baseScore = totalWeight > 0 ? parseFloat((weightedScoreSum / totalWeight).toFixed(2)) : 0;

  // 3. Multiplicative gates
  const credibilityMultiplier = CREDIBILITY_MULTIPLIERS[credibilityRiskLevel] ?? 1.00;
  const adaptationMultiplier = ADAPTATION_MULTIPLIERS[adaptationBurdenLevel] ?? 1.00;
  const isAutoRejected = credibilityRiskLevel === 'FRAUDULENT';

  const finalScore = isAutoRejected
    ? 0.00
    : parseFloat((baseScore * credibilityMultiplier * adaptationMultiplier).toFixed(2));

  // 4. Recommendation Classification Bands
  let recommendationBand: ScoringResult['recommendationBand'] = 'Misaligned';
  if (finalScore >= 85) {
    recommendationBand = 'High Probability Fit';
  } else if (finalScore >= 70) {
    recommendationBand = 'Strong Stretch Fit';
  } else if (finalScore >= 55) {
    recommendationBand = 'Conditional Fit';
  } else if (finalScore >= 40) {
    recommendationBand = 'Weak Alignment';
  }

  return {
    baseScore,
    finalScore,
    credibilityMultiplier,
    adaptationMultiplier,
    isAutoRejected,
    recommendationBand,
    blendedWeights,
    dimensionDetails,
  };
}
