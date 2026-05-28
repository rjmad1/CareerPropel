import { calculateFitScore, ARCHETYPE_WEIGHT_PROFILES, CREDIBILITY_MULTIPLIERS, ADAPTATION_MULTIPLIERS, ScoringInput, DimensionEvaluation } from '@/lib/scoring/scoringEngine';

describe('Canonical Role Intelligence Scoring Engine', () => {
  // Helpers to build standard scoring input
  const makeBaseDimensions = (score: number = 80, confidence: number = 80): DimensionEvaluation[] => [
    { dimension: 'executionProof', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'businessProblemAlignment', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'responsibilityOverlap', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'immediateContribution', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'domainFamiliarity', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'archetypeAlignment', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'adjacentSkillTransfer', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'strategicImpact', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'toolOverlap', score, confidence, evidence: [], reasoning: 'Test evidence' },
    { dimension: 'keywordOverlap', score, confidence, evidence: [], reasoning: 'Test evidence' }
  ];

  test('Should correctly blend weights for a single archetype (Builder)', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(100, 100),
      credibilityRiskLevel: 'NONE',
      adaptationBurdenLevel: 'LOW',
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    // Builder maps to Engineering IC profile
    const expectedProfile = ARCHETYPE_WEIGHT_PROFILES['Engineering IC'];
    
    // Check blended weights (should match raw profiles since sum of archetype weights = 1.0)
    for (const key of Object.keys(expectedProfile)) {
      expect(result.blendedWeights[key]).toBe(expectedProfile[key]);
    }

    // Since raw scores are 100 and confidence is 100, base and final score must be 100
    expect(result.baseScore).toBe(100);
    expect(result.finalScore).toBe(100);
    expect(result.recommendationBand).toBe('High Probability Fit');
  });

  test('Should correctly blend weights for hybrid archetypes (Builder 60% + Operator 40%)', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(100, 100),
      credibilityRiskLevel: 'NONE',
      adaptationBurdenLevel: 'LOW',
      archetypes: [
        { archetype: 'Builder', weight: 0.6 },
        { archetype: 'Operator', weight: 0.4 }
      ]
    };

    const result = calculateFitScore(input);

    // Builder maps to Engineering IC, Operator maps to Operations Leadership
    const profileEng = ARCHETYPE_WEIGHT_PROFILES['Engineering IC'];
    const profileOps = ARCHETYPE_WEIGHT_PROFILES['Operations Leadership'];

    const expectedBlended: Record<string, number> = {};
    let totalEngWeight = 0.6;
    let totalOpsWeight = 0.4;
    let totalWeight = totalEngWeight + totalOpsWeight;

    for (const key of Object.keys(profileEng)) {
      expectedBlended[key] = ((profileEng[key] * totalEngWeight) + (profileOps[key] * totalOpsWeight)) / totalWeight;
    }

    // Check blended weights on 0-100 scale (sum of weights = 1.0)
    for (const key of Object.keys(expectedBlended)) {
      expect(result.blendedWeights[key]).toBeCloseTo(expectedBlended[key], 3);
    }
  });

  test('Should scale down effective score when confidence is below 60%', () => {
    // Set score to 80, confidence to 50 for all dimensions
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(80, 50),
      credibilityRiskLevel: 'NONE',
      adaptationBurdenLevel: 'LOW',
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    // Since confidence < 60, effective score = 80 * (50 / 100) = 40
    // Because all dimensions are identical, final score must be exactly 40
    expect(result.baseScore).toBe(40);
    expect(result.finalScore).toBe(40);
    expect(result.recommendationBand).toBe('Weak Alignment');
  });

  test('Should not scale down effective score when confidence is 60% or higher', () => {
    // Set score to 80, confidence to 70 for all dimensions
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(80, 70),
      credibilityRiskLevel: 'NONE',
      adaptationBurdenLevel: 'LOW',
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    // Since confidence >= 60, effective score = 80
    expect(result.baseScore).toBe(80);
    expect(result.finalScore).toBe(80);
    expect(result.recommendationBand).toBe('Strong Stretch Fit');
  });

  test('Should apply credibility risk multiplicative gate', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(100, 100),
      credibilityRiskLevel: 'HIGH', // Multiplier: 0.55
      adaptationBurdenLevel: 'LOW', // Multiplier: 1.0
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    expect(result.baseScore).toBe(100);
    expect(result.finalScore).toBe(55); // 100 * 0.55
    expect(result.credibilityMultiplier).toBe(0.55);
    expect(result.recommendationBand).toBe('Conditional Fit');
  });

  test('Should apply adaptation burden multiplicative gate', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(100, 100),
      credibilityRiskLevel: 'NONE', // Multiplier: 1.0
      adaptationBurdenLevel: 'EXTREME', // Multiplier: 0.40
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    expect(result.baseScore).toBe(100);
    expect(result.finalScore).toBe(40); // 100 * 0.40
    expect(result.adaptationMultiplier).toBe(0.4);
    expect(result.recommendationBand).toBe('Weak Alignment');
  });

  test('Should auto-reject when credibility risk level is FRAUDULENT', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(100, 100),
      credibilityRiskLevel: 'FRAUDULENT', // Trigger Auto-Reject
      adaptationBurdenLevel: 'LOW',
      archetypes: [{ archetype: 'Builder', weight: 1.0 }]
    };

    const result = calculateFitScore(input);

    expect(result.isAutoRejected).toBe(true);
    expect(result.finalScore).toBe(0);
    expect(result.recommendationBand).toBe('Misaligned');
  });

  test('Should fall back to Default profile weights when no archetypes are provided', () => {
    const input: ScoringInput = {
      dimensions: makeBaseDimensions(90, 95),
      credibilityRiskLevel: 'NONE',
      adaptationBurdenLevel: 'LOW',
      archetypes: []
    };

    const result = calculateFitScore(input);

    const expectedProfile = ARCHETYPE_WEIGHT_PROFILES['Default'];

    for (const key of Object.keys(expectedProfile)) {
      expect(result.blendedWeights[key]).toBe(expectedProfile[key]);
    }

    expect(result.baseScore).toBe(90);
    expect(result.finalScore).toBe(90);
    expect(result.recommendationBand).toBe('High Probability Fit');
  });
});
