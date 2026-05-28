/**
 * Gap Analysis Pipeline
 * Stage 3 of the Fit Evaluation Engine.
 *
 * Takes deconstructed job requirements and mapped candidate strengths,
 * identifies gaps, classifies them (trainable, credibility-killing,
 * domain depth, adaptation speed), and calculates penalty multipliers
 * for the overall fit score.
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
import type { GapAnalysisResult, JobDeconstructionResult, MappedStrength } from '@/lib/fit-engine/types';
import { GapClassification } from '@prisma/client';

const logger = createLogger({ component: 'fit-engine:gap-analysis' });

export interface GapAnalysisInput {
  candidateId: string;
  jobId: string;
  userId: string;
  deconstruction: JobDeconstructionResult;
  strengths: MappedStrength[];
  resumeContent?: string;
  correlationId?: string;
}

export interface GapAnalysisOutput {
  result: GapAnalysisResult;
  executionId: string;
}

export async function analyzeGaps(input: GapAnalysisInput): Promise<GapAnalysisOutput> {
  const { candidateId, jobId, userId, deconstruction, strengths, correlationId } = input;
  const logContext = { candidateId, jobId, userId, correlationId };

  logger.info(logContext, 'Starting gap analysis');

  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType: 'gap-analysis',
      status: 'running',
      input: JSON.stringify({ jobId }),
      startedAt: new Date(),
      correlationId,
    },
  });

  try {
    const systemPrompt = `You are a gap analysis specialist. Compare candidate capabilities to job requirements and identify gaps. Classify each gap precisely: some are trainable, some are credibility-killing, some require domain depth, and some indicate adaptation speed concerns. Be honest and specific.`;

    const llmResult = await callLLM(
      [{ role: 'user', content: buildGapAnalysisPrompt(deconstruction, strengths) }],
      { systemPrompt, temperature: 0.3, maxTokens: 4096 }
    );

    const parsed = parseGapResponse(llmResult.content);
    const saved = await persistGaps({
      candidateId,
      jobId,
      gaps: parsed.gaps,
      executionId: execution.id,
    });

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        output: JSON.stringify(saved),
        tokenCount: llmResult.totalTokens,
        inputTokens: llmResult.inputTokens,
        outputTokens: llmResult.outputTokens,
        durationMs: Date.now() - execution.startedAt!.getTime(),
      },
    });

    logger.info({ ...logContext, gapCount: saved.gaps.length }, 'Gap analysis completed');
    return { result: saved, executionId: execution.id };
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

function buildGapAnalysisPrompt(deconstruction: JobDeconstructionResult, strengths: MappedStrength[]): string {
  const requirementsText = deconstruction.hardRequirements
    .filter((r) => r.riskLevel >= 5) // High-risk requirements
    .map((r) => `- [COMPLEXITY:${r.operationalComplexity}/10, RISK:${r.riskLevel}/10] ${r.requirement}\n  tools: ${r.tools.join(', ')}, decisions: ${r.decisions.join(', ')}, outputs: ${r.outputs.join(', ')}`)
    .join('\n');

  const strengthsText = strengths
    .sort((a, b) => b.matchConfidence - a.matchConfidence)
    .slice(0, 10)
    .map((s) => `- ${s.capability} (confidence: ${s.matchConfidence}, context: ${s.executionContext || 'N/A'})`)
    .join('\n');

  return `Compare the candidate's proven capabilities to the job's high-risk requirements. Identify capability gaps and classify them.

=== HIGH-RISK REQUIREMENTS ===
${requirementsText}

=== CANDIDATE STRENGTHS ===
${strengthsText}

=== OPERATIONAL CONTEXT ===
Role: ${deconstruction.inferredRole.title}
Domain: ${deconstruction.operationalDomain}
Complexity: ${deconstruction.executionComplexity}/10
Business Problems: ${deconstruction.businessProblems.map((bp) => bp.problem).join('; ')}
Decision Ownership Required: ${deconstruction.decisionOwnership.join(', ')}

Return a JSON object with this structure:
{
  "gaps": [
    {
      "gap": "No experience with Kubernetes at scale",
      "classification": "TRAINABLE",
      "severity": 6,
      "penaltyMultiplier": 0.8,
      "adjacentProof": "Managed Docker Swarm clusters with 100+ nodes — adjacent orchestration experience",
      "learningTime": "2-3 weeks with mentorship",
      "learningResources": ["CKA certification course", "Internal k8s workshop"],
      "blockingReason": null,
      "alternativeRoute": null,
      "domainRequired": null,
      "adjacentDomain": null,
      "onboardingComplexity": 6,
      "learningCurve": "moderate",
      "operationalRampTime": "4-6 weeks"
    },
    {
      "gap": "No healthcare industry domain experience",
      "classification": "DOMAIN_DEPTH",
      "severity": 5,
      "penaltyMultiplier": 0.9,
      "adjacentProof": null,
      "learningTime": "3-6 months to reach fluency",
      "learningResources": ["HIPAA compliance training", "Healthcare API standards"],
      "blockingReason": null,
      "alternativeRoute": null,
      "domainRequired": "healthcare",
      "adjacentDomain": "fintech (regulated, compliance-heavy)",
      "onboardingComplexity": 7,
      "learningCurve": "steep",
      "operationalRampTime": "6-8 weeks"
    },
    {
      "gap": "No experience managing a team of 10+ engineers",
      "classification": "CREDIBILITY_KILLING",
      "severity": 9,
      "penaltyMultiplier": 0.3,
      "adjacentProof": null,
      "learningTime": null,
      "learningResources": [],
      "blockingReason": "Hiring manager will see this gap immediately — cannot fake scope of management",
      "alternativeRoute": "Emphasize technical leadership cross-functionally with influence without authority",
      "domainRequired": null,
      "adjacentDomain": null,
      "onboardingComplexity": 9,
      "learningCurve": "steep",
      "operationalRampTime": "6-12 months"
    }
  ]
}

Classification rules:
- TRAINABLE: Skill/knowledge gap that can be closed in < 3 months with deliberate effort. Adjacent proof exists.
- CREDIBILITY_KILLING: Gap that will cause hiring manager to auto-reject. Experience that cannot be faked. Missing a fundamental block.
- DOMAIN_DEPTH: Domain/industry expertise gap. Takes 6+ months to build. Adjacent domains may partially mitigate.
- ADAPTATION_SPEED: Indicates need for significant ramp time due to context shift, toolchain change, or operational model difference.

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences.`;
}

function parseGapResponse(rawResponse: string): { gaps: GapAnalysisResult['gaps'] } {
  const jsonStr = extractJson(rawResponse);
  if (!jsonStr) throw new Error('No valid JSON found in gap analysis response');

  let parsed: Record<string, unknown>;
  try { parsed = JSON.parse(jsonStr); } catch (err) { throw new Error(`Failed to parse gap analysis JSON: ${err}`); }

  const validClassifications: GapClassification[] = ['TRAINABLE', 'CREDIBILITY_KILLING', 'DOMAIN_DEPTH', 'ADAPTATION_SPEED'];

  const gaps = Array.isArray(parsed.gaps)
    ? (parsed.gaps as Record<string, unknown>[]).map((g) => ({
        gap: toString(g.gap, 'Unknown gap'),
        classification: validClassifications.includes(g.classification as GapClassification)
          ? (g.classification as GapClassification)
          : 'TRAINABLE' as GapClassification,
        severity: clamp(toInt(g.severity, 5), 1, 10),
        penaltyMultiplier: clamp(toFloat(g.penaltyMultiplier, 1.0), 0, 1),
        adjacentProof: toStringOrNull(g.adjacentProof),
        learningTime: toStringOrNull(g.learningTime),
        learningResources: toStringArray(g.learningResources),
        blockingReason: toStringOrNull(g.blockingReason),
        alternativeRoute: toStringOrNull(g.alternativeRoute),
        domainRequired: toStringOrNull(g.domainRequired),
        adjacentDomain: toStringOrNull(g.adjacentDomain),
        onboardingComplexity: toIntOrNull(g.onboardingComplexity),
        learningCurve: toStringOrNull(g.learningCurve),
        operationalRampTime: toStringOrNull(g.operationalRampTime),
      }))
    : [];

  return { gaps };
}

async function persistGaps(opts: {
  candidateId: string;
  jobId: string;
  gaps: GapAnalysisResult['gaps'];
  executionId: string;
}): Promise<GapAnalysisResult> {
  const { candidateId, jobId, gaps } = opts;

  // Replace existing gaps
  await prisma.fitGap.deleteMany({
    where: { candidateId, jobId },
  });

  for (const g of gaps) {
    await prisma.fitGap.create({
      data: {
        candidateId,
        jobId,
        gap: g.gap,
        classification: g.classification,
        severity: g.severity,
        penaltyMultiplier: g.penaltyMultiplier,
        adjacentProof: g.adjacentProof,
        learningTime: g.learningTime,
        learningResources: g.learningResources,
        blockingReason: g.blockingReason,
        alternativeRoute: g.alternativeRoute,
        domainRequired: g.domainRequired,
        adjacentDomain: g.adjacentDomain,
        onboardingComplexity: g.onboardingComplexity,
        learningCurve: g.learningCurve,
        operationalRampTime: g.operationalRampTime,
      },
    });
  }

  // Record analysis
  await prisma.roleFitAnalysis.create({
    data: {
      candidateId,
      jobId,
      analysisType: 'gap_analysis',
      results: { gapCount: gaps.length, classifiedGaps: gaps.map((g) => ({ classification: g.classification, severity: g.severity })) },
      executionId: opts.executionId,
      agentType: 'gap-analysis',
    },
  });

  // Compute summary stats
  const credibilityGaps = gaps.filter((g) => g.classification === 'CREDIBILITY_KILLING').length;
  const trainableGaps = gaps.filter((g) => g.classification === 'TRAINABLE').length;
  const domainDepthGaps = gaps.filter((g) => g.classification === 'DOMAIN_DEPTH').length;
  const adaptationSpeedGaps = gaps.filter((g) => g.classification === 'ADAPTATION_SPEED').length;
  const totalPenaltyMultiplier = gaps.reduce((p, g) => p * g.penaltyMultiplier, 1.0);

  const avgSeverity = gaps.length > 0 ? gaps.reduce((s, g) => s + g.severity, 0) / gaps.length : 0;
  const adaptationBurden: 'low' | 'medium' | 'high' =
    avgSeverity >= 7 || adaptationSpeedGaps > 2 ? 'high'
    : avgSeverity >= 4 || adaptationSpeedGaps > 0 ? 'medium'
    : 'low';

  return {
    gaps,
    credibilityGaps,
    trainableGaps,
    domainDepthGaps,
    adaptationSpeedGaps,
    totalPenaltyMultiplier,
    adaptationBurden,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractJson(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) return trimmed;
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) return trimmed;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const content = fenceMatch[1].trim();
    if (content.startsWith('{') || content.startsWith('[')) return content;
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];
  return null;
}

function toString(val: unknown, fallback: string): string {
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : fallback;
}

function toStringOrNull(val: unknown): string | null {
  return typeof val === 'string' && val.trim().length > 0 ? val.trim() : null;
}

function toStringArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string').map((s) => s.trim()).filter(Boolean);
  return [];
}

function toFloat(val: unknown, fallback: number): number {
  return typeof val === 'number' ? val : fallback;
}

function toInt(val: unknown, fallback: number): number {
  return typeof val === 'number' ? Math.round(val) : fallback;
}

function toIntOrNull(val: unknown): number | null {
  return typeof val === 'number' ? Math.round(val) : null;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
