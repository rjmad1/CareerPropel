/**
 * Weighted Scoring Pipeline
 * Stage 4 of the Fit Evaluation Engine.
 *
 * Takes deconstruction, strength mapping, and gap analysis results,
 * and produces an 11-dimensional weighted fit score.
 * Includes recommendation logic and suppression rules.
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
import { Prisma } from '@prisma/client';
import {
  FitDimension,
  FitScoreResult,
  DimensionScore,
  JobDeconstructionResult,
  StrengthMappingResult,
  GapAnalysisResult,
} from '../types';
import {
  DEFAULT_DIMENSION_WEIGHTS,
  RECOMMENDATION_THRESHOLDS,
  SUPPRESSION_RULES,
  CURRENT_ANALYSIS_VERSION,
} from '@/lib/fit-engine/constants';

const logger = createLogger({ component: 'fit-engine:scoring' });

export interface ScoringInput {
  candidateId: string;
  jobId: string;
  userId: string;
  deconstruction: JobDeconstructionResult;
  strengths: StrengthMappingResult;
  gaps: GapAnalysisResult;
  customWeights?: Partial<Record<FitDimension, number>>;
  patternAdjustments?: Array<{ dimension: FitDimension; modifier: number }>;
  correlationId?: string;
}

export interface ScoringOutput {
  result: FitScoreResult;
  executionId: string;
}

/**
 * Compute the final fit score from all upstream pipeline results.
 * Uses an LLM to assess each dimension, then applies deterministic weights.
 */
export async function scoreFit(input: ScoringInput): Promise<ScoringOutput> {
  const { candidateId, jobId, userId, deconstruction, strengths, gaps, customWeights, patternAdjustments, correlationId } = input;
  const logContext = { candidateId, jobId, userId, correlationId };

  logger.info(logContext, 'Starting fit scoring');

  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType: 'fit-scoring',
      status: 'running',
      input: JSON.stringify({ jobId }),
      startedAt: new Date(),
      correlationId,
    },
  });

  try {
    // 1. Get base weights (with optional overrides)
    const weights = { ...DEFAULT_DIMENSION_WEIGHTS, ...customWeights };

    // 2. Apply pattern library adjustments
    if (patternAdjustments) {
      for (const adj of patternAdjustments) {
        const baseWeight = weights[adj.dimension] ?? 0;
        weights[adj.dimension] = clamp(baseWeight + adj.modifier, 0, 1);
      }
    }

    // 3. Normalize weights to sum to 1
    const normalizedWeights = normalizeWeights(weights);
    logger.debug({ ...logContext, weights: normalizedWeights }, 'Normalized weights');

    // 4. Get LLM dimension assessments
    const dimensionScores = await assessDimensions(
      deconstruction,
      strengths,
      gaps,
      normalizedWeights
    );

    // 5. Compute aggregate scores
    const overallFitScore = Object.values(dimensionScores)
      .reduce((sum, ds) => sum + ds.contribution, 0);

    const credibilityRiskScore = dimensionScores.CREDIBILITY_RISK?.score ?? 0;
    const adaptationRiskScore = dimensionScores.ADAPTATION_BURDEN?.score ?? 0;

    // 6. Determine recommendation
    const recommendation = determineRecommendation(overallFitScore, credibilityRiskScore);

    // 7. Check suppression rules
    const suppression = checkSuppressionRules(dimensionScores);

    const result: FitScoreResult = {
      overallFitScore: clamp(overallFitScore, 0, 1),
      interviewConversionProbability: computeConversionProbability(overallFitScore, credibilityRiskScore, strengthMappingScore(strengths)),
      immediateContributionScore: dimensionScores.IMMEDIATE_CONTRIBUTION_CAPABILITY?.score ?? 0,
      credibilityRiskScore,
      skillTransferScore: dimensionScores.ADJACENT_SKILL_TRANSFER?.score ?? 0,
      businessProblemAlignmentScore: dimensionScores.BUSINESS_PROBLEM_ALIGNMENT?.score ?? 0,
      adaptationRiskScore,
      roleClarityScore: dimensionScores.ARCHETYPE_ALIGNMENT?.score ?? 0,
      employerPainMatchScore: dimensionScores.DEMONSTRATED_EXECUTION_PROOF?.score ?? 0,
      dimensionScores,
      weights: normalizedWeights as Record<FitDimension, number>,
      weightsVersion: CURRENT_ANALYSIS_VERSION,
      strongestLeveragePoints: extractTopFactors(dimensionScores, 3, true),
      biggestBlockers: extractTopFactors(dimensionScores, 3, false),
      expectedRecruiterPerception: buildRecruiterPerception(
        dimensionScores,
        recommendation.recommendation,
        strengths,
        gaps
      ),
      recommendation: recommendation.recommendation,
      recommendationRationale: recommendation.rationale,
      suppressed: suppression.suppressed,
      suppressionReason: suppression.reason,
    };

    // 8. Persist scoring snapshot
    await persistScoring({
      candidateId,
      jobId,
      result,
      executionId: execution.id,
    });

    // Update execution
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify(result),
        durationMs: Date.now() - execution.startedAt!.getTime(),
      },
    });

    logger.info({ ...logContext, fitScore: result.overallFitScore, recommendation: result.recommendation }, 'Fit scoring completed');
    return { result, executionId: execution.id };
  } catch (error) {
    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

/**
 * Use LLM to assess each scoring dimension based on the evidence.
 */
async function assessDimensions(
  deconstruction: JobDeconstructionResult,
  strengths: StrengthMappingResult,
  gaps: GapAnalysisResult,
  weights: Record<string, number>
): Promise<Record<FitDimension, DimensionScore>> {
  const systemPrompt = `You are a hiring fit assessment specialist. Score each dimension of candidate-job fit based on the provided evidence. Be objective and data-driven.`;

  const userPrompt = buildDimensionAssessmentPrompt(deconstruction, strengths, gaps);

  const llmResult = await callLLM(
    [{ role: 'user', content: userPrompt }],
    { systemPrompt, temperature: 0.2, maxTokens: 4096 }
  );

  return parseDimensionScores(llmResult.content, weights);
}

function buildDimensionAssessmentPrompt(
  deconstruction: JobDeconstructionResult,
  strengths: StrengthMappingResult,
  gaps: GapAnalysisResult
): string {
  const dimDescriptions = [
    { id: 'DEMONSTRATED_EXECUTION_PROOF', label: 'Demonstrated Execution Proof', description: 'Has the candidate done this exact thing before?' },
    { id: 'BUSINESS_PROBLEM_ALIGNMENT', label: 'Business Problem Alignment', description: 'Does the candidate have relevant experience solving the employer\'s specific pain points?' },
    { id: 'RESPONSIBILITY_OVERLAP', label: 'Responsibility Overlap', description: 'How much do the candidate\'s past responsibilities overlap with the role\'s?' },
    { id: 'TOOL_OVERLAP', label: 'Tool Overlap', description: 'Tool/tech stack alignment between candidate and job' },
    { id: 'KEYWORD_OVERLAP', label: 'Keyword Overlap', description: 'Keyword/A TS term matching' },
    { id: 'ADJACENT_SKILL_TRANSFER', label: 'Adjacent Skill Transfer', description: 'How well do adjacent skills compensate for direct gaps?' },
    { id: 'DOMAIN_FAMILIARITY', label: 'Domain Familiarity', description: 'Industry/domain knowledge alignment' },
    { id: 'ARCHETYPE_ALIGNMENT', label: 'Archetype Alignment', description: 'Does the candidate\'s natural working style match the role\'s archetype?' },
    { id: 'IMMEDIATE_CONTRIBUTION_CAPABILITY', label: 'Immediate Contribution', description: 'How quickly can the candidate add value?' },
    { id: 'STRATEGIC_IMPACT_ALIGNMENT', label: 'Strategic Impact', description: 'Long-term strategic alignment' },
    { id: 'CREDIBILITY_RISK', label: 'Credibility Risk', description: 'Will the recruiter/hiring manager detect gaps?' },
    { id: 'ADAPTATION_BURDEN', label: 'Adaptation Burden', description: 'How much will the candidate need to adapt to new context?' },
  ];

  const dimsText = dimDescriptions.map((d) => `${d.label} — ${d.description}`).join('\n');
  const strengthsText = strengths.topStrengths.map((s) => `- ${s.capability} (rarity: ${s.rarityScore}, match: ${s.matchConfidence}) — ${s.employerInterpretation || ''}`).join('\n');
  const gapsText = gaps.gaps.map((g) => `- [${g.classification}/sev:${g.severity}] ${g.gap} (penalty: ${g.penaltyMultiplier})`).join('\n');

  return `Score the candidate fit across these dimensions:

=== ROLE CONTEXT ===
Inferred Role: ${deconstruction.inferredRole.title}
Archetype: ${deconstruction.inferredRole.archetype}
Domain: ${deconstruction.operationalDomain}
Complexity: ${deconstruction.executionComplexity}/10
Business Problems: ${deconstruction.businessProblems.map((bp) => `[sev:${bp.severity}] ${bp.problem}`).join('; ')}

=== STRENGTHS ===
${strengthsText || 'No strengths mapped'}

=== GAPS ===
${gapsText || 'No gaps identified'}

=== DIMENSIONS TO SCORE ===
${dimsText}

Return a JSON array of dimension scores:
[
  {
    "dimension": "DEMONSTRATED_EXECUTION_PROOF",
    "score": 0.85,
    "evidence": "Led 3 microservices migrations at similar scale — direct proof of this exact responsibility",
    "confidence": 0.9
  },
  {
    "dimension": "ADAPTATION_BURDEN",
    "score": 0.3,
    "evidence": "Most tools are familiar; primary gap is healthcare domain knowledge which is trainable",
    "confidence": 0.75
  }
]

Scoring rules:
- Score 0-1: 0 = no match, 1 = perfect match
- For CREDIBILITY_RISK and ADAPTATION_BURDEN: higher = more risk (worse)
- Evidence must be specific and evidence-based
- Confidence reflects how certain you are about the score

IMPORTANT: Score ALL 12 dimensions. Return ONLY valid JSON array.`;
}

function parseDimensionScores(raw: string, weights: Record<string, number>): Record<FitDimension, DimensionScore> {
  const jsonStr = extractJson(raw);
  if (!jsonStr) throw new Error('No valid JSON in dimension scoring response');

  let parsed: Array<Record<string, unknown>>;
  try {
    const p = JSON.parse(jsonStr);
    parsed = Array.isArray(p) ? p : Array.isArray(p.dimensions) ? p.dimensions : [];
  } catch (err) {
    throw new Error(`Failed to parse dimension scores: ${err}`);
  }

  const validDimensions: FitDimension[] = [
    FitDimension.DEMONSTRATED_EXECUTION_PROOF,
    FitDimension.BUSINESS_PROBLEM_ALIGNMENT,
    FitDimension.RESPONSIBILITY_OVERLAP,
    FitDimension.TOOL_OVERLAP,
    FitDimension.KEYWORD_OVERLAP,
    FitDimension.ADJACENT_SKILL_TRANSFER,
    FitDimension.DOMAIN_FAMILIARITY,
    FitDimension.ARCHETYPE_ALIGNMENT,
    FitDimension.IMMEDIATE_CONTRIBUTION_CAPABILITY,
    FitDimension.STRATEGIC_IMPACT_ALIGNMENT,
    FitDimension.CREDIBILITY_RISK,
    FitDimension.ADAPTATION_BURDEN,
  ];

  const dimensions: Record<FitDimension, DimensionScore> = {} as Record<FitDimension, DimensionScore>;

  for (const d of validDimensions) {
    const match = parsed.find((p) => p.dimension === d);
    const weight = weights[d] ?? 0;
    const score = match && typeof match.score === 'number' ? clamp(match.score, 0, 1) : 0.5;

    dimensions[d] = {
      dimension: d,
      score,
      weight,
      contribution: score * weight,
      evidence: typeof match?.evidence === 'string' ? match.evidence : 'Auto-scored (no LLM evidence)',
      confidence: match && typeof match.confidence === 'number' ? clamp(match.confidence, 0, 1) : 0.5,
    };
  }

  return dimensions;
}

function determineRecommendation(
  score: number,
  credibilityRisk: number
): { recommendation: FitScoreResult['recommendation']; rationale: string } {
  // Suppression overrides everything
  if (credibilityRisk >= 0.8) {
    return {
      recommendation: 'SUPPRESS',
      rationale: 'High credibility risk — gaps likely to block hiring manager trust. Candidate should address gaps before applying.',
    };
  }

  if (score >= RECOMMENDATION_THRESHOLDS.STRONG_PURSUE) {
    return {
      recommendation: 'STRONG_PURSUE',
      rationale: `Strong overall fit (${(score * 100).toFixed(0)}%). High probability of interview conversion. Prioritize this role.`,
    };
  }

  if (score >= RECOMMENDATION_THRESHOLDS.PURSUE) {
    return {
      recommendation: 'PURSUE',
      rationale: `Good fit (${(score * 100).toFixed(0)}%). Apply and prepare. Address ${credibilityRisk > 0.5 ? 'some credibility gaps' : 'minor gaps'} in cover letter.`,
    };
  }

  if (score >= RECOMMENDATION_THRESHOLDS.CONSIDER) {
    return {
      recommendation: 'CONSIDER',
      rationale: `Moderate fit (${(score * 100).toFixed(0)}%). Worth applying if capacity allows, but prioritize higher-fit roles first.`,
    };
  }

  if (score >= RECOMMENDATION_THRESHOLDS.DEPRIORITIZE) {
    return {
      recommendation: 'DEPRIORITIZE',
      rationale: `Low fit (${(score * 100).toFixed(0)}%). Significant gaps relative to role requirements. Focus on better-aligned opportunities.`,
    };
  }

  return {
    recommendation: 'SUPPRESS',
    rationale: `Very low fit (${(score * 100).toFixed(0)}%). Not recommended for pursuit.`,
  };
}

function checkSuppressionRules(
  dimensionScores: Record<FitDimension, DimensionScore>
): { suppressed: boolean; reason: string | null } {
  for (const rule of SUPPRESSION_RULES) {
    const dimScore = dimensionScores[rule.dimension];
    if (dimScore && dimScore.score >= rule.threshold) {
      return { suppressed: true, reason: rule.reason };
    }
  }
  return { suppressed: false, reason: null };
}

function computeConversionProbability(
  fitScore: number,
  credibilityRisk: number,
  strengthScore: number
): number {
  // Logistic-ish conversion: fit × (1 - credibilityRisk × 0.5) × strengthBoost
  const base = fitScore * (1 - credibilityRisk * 0.5);
  const boost = strengthScore * 0.15;
  return clamp(base + boost, 0, 1);
}

function strengthMappingScore(strengths: StrengthMappingResult): number {
  return (strengths.totalRarityScore * 0.4 + strengths.totalProofDensity * 0.6);
}

function extractTopFactors(
  dimensionScores: Record<FitDimension, DimensionScore>,
  count: number,
  highest: boolean
): string[] {
  const entries = Object.values(dimensionScores)
    .filter((ds) => ds.dimension !== 'CREDIBILITY_RISK' && ds.dimension !== 'ADAPTATION_BURDEN')
    .sort((a, b) => highest ? b.contribution - a.contribution : a.contribution - b.contribution);

  return entries.slice(0, count).map((ds) => `${ds.dimension}: ${(ds.score * 100).toFixed(0)}% — ${ds.evidence.slice(0, 120)}`);
}

function buildRecruiterPerception(
  _dimensionScores: Record<FitDimension, DimensionScore>,
  recommendation: FitScoreResult['recommendation'],
  strengths: StrengthMappingResult,
  gaps: GapAnalysisResult
): string {
  const topStrength = strengths.topStrengths[0];
  const worstGap = gaps.gaps.sort((a, b) => b.severity - a.severity)[0];

  const parts: string[] = [];

  if (topStrength) {
    parts.push(`Strongest selling point: "${topStrength.employerInterpretation || topStrength.capability}"`);
  }

  if (worstGap && worstGap.classification === 'CREDIBILITY_KILLING') {
    parts.push(`Risk: "${worstGap.gap}" — ${worstGap.blockingReason || 'may cause auto-rejection'}`);
  }

  if (recommendation === 'STRONG_PURSUE' || recommendation === 'PURSUE') {
    parts.push('Recommend pursuing this role — good alignment with employer needs.');
  } else if (recommendation === 'CONSIDER') {
    parts.push('Consider applying — moderate alignment; address notable gaps strategically.');
  } else {
    parts.push('Low alignment — better opportunities likely available elsewhere.');
  }

  return parts.join('\n');
}

function normalizeWeights<T extends string>(weights: Record<T, number>): Record<T, number> {
  const sum = Object.values<number>(weights as Record<string, number>).reduce((s, w) => s + w, 0);
  if (sum === 0) return weights;

  const normalized = {} as Record<T, number>;
  for (const [key, val] of Object.entries(weights) as [T, number][]) {
    normalized[key] = val / sum;
  }
  return normalized;
}

async function persistScoring(opts: {
  candidateId: string;
  jobId: string;
  result: FitScoreResult;
  executionId: string;
}) {
  const { candidateId, jobId, result } = opts;

  await prisma.fitScoringSnapshot.upsert({
    where: { jobId },
    create: {
      candidateId,
      jobId,
      fitScore: result.overallFitScore,
      interviewConversionProbability: result.interviewConversionProbability,
      immediateContributionScore: result.immediateContributionScore,
      credibilityRiskScore: result.credibilityRiskScore,
      skillTransferScore: result.skillTransferScore,
      businessProblemAlignmentScore: result.businessProblemAlignmentScore,
      adaptationRiskScore: result.adaptationRiskScore,
      roleClarityScore: result.roleClarityScore,
      employerPainMatchScore: result.employerPainMatchScore,
      dimensionScores: result.dimensionScores as unknown as Prisma.InputJsonValue,
      weightsVersion: result.weightsVersion,
      weights: result.weights as unknown as Prisma.InputJsonValue,
      strongestLeveragePoints: result.strongestLeveragePoints,
      biggestBlockers: result.biggestBlockers,
      expectedRecruiterPerception: result.expectedRecruiterPerception,
      recommendation: result.recommendation,
      recommendationRationale: result.recommendationRationale,
      suppressed: result.suppressed,
      suppressionReason: result.suppressionReason,
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      analyzedAt: new Date(),
    },
    update: {
      fitScore: result.overallFitScore,
      interviewConversionProbability: result.interviewConversionProbability,
      immediateContributionScore: result.immediateContributionScore,
      credibilityRiskScore: result.credibilityRiskScore,
      skillTransferScore: result.skillTransferScore,
      businessProblemAlignmentScore: result.businessProblemAlignmentScore,
      adaptationRiskScore: result.adaptationRiskScore,
      roleClarityScore: result.roleClarityScore,
      employerPainMatchScore: result.employerPainMatchScore,
      dimensionScores: result.dimensionScores as unknown as Prisma.InputJsonValue,
      weightsVersion: result.weightsVersion,
      weights: result.weights as unknown as Prisma.InputJsonValue,
      strongestLeveragePoints: result.strongestLeveragePoints,
      biggestBlockers: result.biggestBlockers,
      expectedRecruiterPerception: result.expectedRecruiterPerception,
      recommendation: result.recommendation,
      recommendationRationale: result.recommendationRationale,
      suppressed: result.suppressed,
      suppressionReason: result.suppressionReason,
      analysisVersion: CURRENT_ANALYSIS_VERSION,
      analyzedAt: new Date(),
    },
  });

  // Record analysis
  await prisma.roleFitAnalysis.create({
    data: {
      candidateId,
      jobId,
      analysisType: 'fit_scoring',
      results: {
        fitScore: result.overallFitScore,
        recommendation: result.recommendation,
        dimensionCount: Object.keys(result.dimensionScores).length,
      } as unknown as Prisma.InputJsonValue,
      executionId: opts.executionId,
      agentType: 'fit-scoring',
      modelVersion: 'claude-sonnet-4-6',
    },
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractJson(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const content = fenceMatch[1].trim();
    if (content.startsWith('[') || content.startsWith('{')) return content;
  }
  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  return null;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
