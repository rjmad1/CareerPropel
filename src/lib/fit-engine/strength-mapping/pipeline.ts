/**
 * Strength Mapping Pipeline
 * Stage 2 of the Fit Evaluation Engine.
 *
 * Takes a candidate's profile (resume, accomplishments, STAR stories) and a job's
 * deconstructed requirements, and maps candidate strengths directly to employer needs.
 * Translates candidate evidence into employer language.
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';
import type { MappedStrength, StrengthMappingResult, JobDeconstructionResult } from '@/lib/fit-engine/types';

const logger = createLogger({ component: 'fit-engine:strength-mapping' });

export interface StrengthMappingInput {
  candidateId: string;
  jobId: string;
  userId: string;
  deconstruction: JobDeconstructionResult;
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
  correlationId?: string;
}

export interface StrengthMappingOutput {
  result: StrengthMappingResult;
  executionId: string;
}

/**
 * Execute strength mapping: align candidate proof points to employer needs.
 */
export async function mapStrengths(input: StrengthMappingInput): Promise<StrengthMappingOutput> {
  const { candidateId, jobId, userId, deconstruction, resumeContent, accomplishments, starStories, correlationId } = input;
  const logContext = { candidateId, jobId, userId, correlationId };

  logger.info(logContext, 'Starting strength mapping');

  const execution = await prisma.agentExecution.create({
    data: {
      userId,
      agentType: 'strength-mapping',
      status: 'running',
      input: JSON.stringify({ jobId, deconstructionSummary: deconstruction.inferredRole.title }),
      startedAt: new Date(),
      correlationId,
    },
  });

  try {
    // Build candidate evidence summary
    const evidenceSummary = buildEvidenceSummary(resumeContent, accomplishments, starStories);

    // Build job needs summary
    const needsSummary = buildNeedsSummary(deconstruction);

    // Call LLM to map strengths
    const systemPrompt = `You are a career strength analyst. Your job is to map a candidate's proven capabilities to an employer's needs, translating the candidate's experience into the employer's operational language. Be precise and evidence-based. Do not inflate or fabricate.`;

    const llmResult = await callLLM(
      [{ role: 'user', content: buildMappingPrompt(evidenceSummary, needsSummary) }],
      { systemPrompt, temperature: 0.3, maxTokens: 4096 }
    );

    // Parse and validate
    const parsed = parseMappingResponse(llmResult.content);

    // Persist results
    const saved = await persistStrengths({
      candidateId,
      jobId,
      strengths: parsed.strengths,
      userId,
      executionId: execution.id,
    });

    // Update execution
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

    logger.info({ ...logContext, strengthCount: saved.strengths.length }, 'Strength mapping completed');

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

function buildEvidenceSummary(resumeContent: string, accomplishments: Array<{ title: string; description: string; metrics: string | null; starContext: string | null; category: string }>, starStories: Array<{ title: string; situation: string; task: string; action: string; result: string }>): string {
  const parts: string[] = ['=== RESUME CONTENT ===', resumeContent];

  if (accomplishments.length > 0) {
    parts.push('\n=== ACCOMPLISHMENTS ===');
    for (const acc of accomplishments) {
      parts.push(`- [${acc.category}] ${acc.title}: ${acc.description}${acc.metrics ? ` (Metrics: ${acc.metrics})` : ''}`);
    }
  }

  if (starStories.length > 0) {
    parts.push('\n=== STAR STORIES ===');
    for (const story of starStories) {
      parts.push(`- ${story.title}: S=${story.situation.slice(0, 200)} | T=${story.task.slice(0, 200)} | A=${story.action.slice(0, 200)} | R=${story.result.slice(0, 200)}`);
    }
  }

  return parts.join('\n');
}

function buildNeedsSummary(deconstruction: JobDeconstructionResult): string {
  const parts: string[] = [
    `Inferred Role: ${deconstruction.inferredRole.title}`,
    `Archetype: ${deconstruction.inferredRole.archetype}`,
    `Domain: ${deconstruction.operationalDomain}`,
    `Complexity: ${deconstruction.executionComplexity}/10`,
    `Organizational Leverage: ${deconstruction.organizationalLeverage}/10`,
  ];

  parts.push('\nHard Requirements:');
  for (const req of deconstruction.hardRequirements) {
    parts.push(`- ${req.requirement} [tools: ${req.tools.join(', ') || 'none'}] [decisions: ${req.decisions.join(', ') || 'none'}]`);
  }

  parts.push('\nBusiness Problems:');
  for (const bp of deconstruction.businessProblems) {
    parts.push(`- [${bp.category}/sev:${bp.severity}] ${bp.problem}`);
  }

  parts.push('\nOperational Signals:');
  for (const sig of deconstruction.operationalSignals) {
    parts.push(`- [${sig.signalType}/freq:${sig.frequency}] ${sig.signal}`);
  }

  return parts.join('\n');
}

function buildMappingPrompt(evidence: string, needs: string): string {
  return `Map the candidate's evidence to the employer's needs. For each candidate capability, explain how it directly addresses an employer requirement or business problem.

${needs}

${evidence}

Provide a JSON array of mapped strengths with this structure:
{
  "strengths": [
    {
      "capability": "Distributed systems architecture and scaling",
      "source": "resume",
      "measurableOutcome": "Reduced p99 latency by 40% across 200+ services",
      "businessImpact": "Improved customer experience and reduced infrastructure costs by $1.2M/yr",
      "executionContext": "Led migration from monolith to microservices at Uber-scale",
      "scale": "200+ services, 500+ engineers",
      "decisionOwnership": "Architecture decisions, technology selection, incident response",
      "operationalComplexity": 8,
      "systemsInfluenced": ["monolith", "microservices", "Kubernetes", "observability stack"],
      "stakeholderLevel": "VP of Engineering, 5 engineering teams",
      "repeatability": "High — documented migration patterns reused across 3 teams",
      "employerInterpretation": "Can own platform reliability at scale — directly addresses the 'infrastructure scaling' business problem",
      "economicImpact": "Economics: $1.2M/yr infrastructure savings, 40% latency improvement → revenue retention",
      "operationalLeverage": "Amplifies 5 engineering teams' productivity through reliable platform",
      "rarityScore": 0.85,
      "leverageScore": 0.9,
      "replacementCost": 0.75,
      "businessBottleneckScore": 0.8,
      "matchedProblems": ["Platform stability at scale", "Infrastructure reliability"],
      "matchConfidence": 0.88
    }
  ],
  "topStrengthIndices": [0, 2, 4],
  "totalRarityScore": 0.75,
  "totalProofDensity": 0.82,
  "strongestCapabilityClusters": ["platform engineering", "distributed systems", "team leadership"],
  "employerLanguageVersions": {
    "led microservices migration": "owned multi-team platform transformation at scale",
    "improved latency": "delivered measurable customer-facing reliability improvements"
  }
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no explanatory text.`;
}

function parseMappingResponse(rawResponse: string): StrengthMappingResult {
  const jsonStr = extractJson(rawResponse);
  if (!jsonStr) {
    throw new Error('No valid JSON found in strength mapping response');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse strength mapping JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  const strengths = Array.isArray(parsed.strengths)
    ? (parsed.strengths as Record<string, unknown>[]).map(validateStrength)
    : [];

  const topIndices = Array.isArray(parsed.topStrengthIndices)
    ? (parsed.topStrengthIndices as number[]).filter((i) => i >= 0 && i < strengths.length)
    : [];

  const topStrengths = topIndices.length > 0
    ? topIndices.map((i) => strengths[i])
    : strengths.slice(0, 5);

  return {
    strengths,
    topStrengths,
    totalRarityScore: toFloat(parsed.totalRarityScore, 0),
    totalProofDensity: toFloat(parsed.totalProofDensity, 0),
    strongestCapabilityClusters: toStringArray(parsed.strongestCapabilityClusters),
    employerLanguageVersions: toRecord(parsed.employerLanguageVersions),
  };
}

function validateStrength(raw: Record<string, unknown>): MappedStrength {
  return {
    capability: toString(raw.capability, 'Unknown capability'),
    source: toString(raw.source, 'resume'),
    measurableOutcome: toStringOrNull(raw.measurableOutcome),
    businessImpact: toStringOrNull(raw.businessImpact),
    executionContext: toStringOrNull(raw.executionContext),
    scale: toStringOrNull(raw.scale),
    decisionOwnership: toStringOrNull(raw.decisionOwnership),
    operationalComplexity: toIntOrNull(raw.operationalComplexity),
    systemsInfluenced: toStringArray(raw.systemsInfluenced),
    stakeholderLevel: toStringOrNull(raw.stakeholderLevel),
    repeatability: toStringOrNull(raw.repeatability),
    employerInterpretation: toStringOrNull(raw.employerInterpretation),
    economicImpact: toStringOrNull(raw.economicImpact),
    operationalLeverage: toStringOrNull(raw.operationalLeverage),
    rarityScore: clamp(toFloat(raw.rarityScore, 0.5), 0, 1),
    leverageScore: clamp(toFloat(raw.leverageScore, 0.5), 0, 1),
    replacementCost: clamp(toFloat(raw.replacementCost, 0.5), 0, 1),
    businessBottleneckScore: clamp(toFloat(raw.businessBottleneckScore, 0.5), 0, 1),
    matchedProblems: toStringArray(raw.matchedProblems),
    matchConfidence: clamp(toFloat(raw.matchConfidence, 0.5), 0, 1),
  };
}

async function persistStrengths(opts: {
  candidateId: string;
  jobId: string;
  strengths: MappedStrength[];
  userId: string;
  executionId: string;
}): Promise<StrengthMappingResult> {
  const { candidateId, jobId, strengths } = opts;

  // Clear existing strength evidence for this job
  await prisma.strengthEvidence.deleteMany({
    where: { candidateId, jobId },
  });

  // Save each strength as a StrengthEvidence record
  for (const s of strengths) {
    await prisma.strengthEvidence.create({
      data: {
        candidateId,
        jobId,
        source: s.source,
        capability: s.capability,
        measurableOutcome: s.measurableOutcome,
        businessImpact: s.businessImpact,
        executionContext: s.executionContext,
        scale: s.scale,
        decisionOwnership: s.decisionOwnership,
        operationalComplexity: s.operationalComplexity,
        systemsInfluenced: s.systemsInfluenced,
        stakeholderLevel: s.stakeholderLevel,
        repeatability: s.repeatability,
        employerInterpretation: s.employerInterpretation,
        economicImpact: s.economicImpact,
        operationalLeverage: s.operationalLeverage,
        rarityScore: s.rarityScore,
        leverageScore: s.leverageScore,
        replacementCost: s.replacementCost,
        businessBottleneckScore: s.businessBottleneckScore,
        matchedProblems: s.matchedProblems,
        matchConfidence: s.matchConfidence,
      },
    });
  }

  // Record analysis
  await prisma.roleFitAnalysis.create({
    data: {
      candidateId,
      jobId,
      analysisType: 'strength_mapping',
      results: { strengthCount: strengths.length, topCapabilities: strengths.slice(0, 5).map((s) => s.capability) },
      executionId: opts.executionId,
      agentType: 'strength-mapping',
    },
  });

  const topStrengths = [...strengths]
    .sort((a, b) => (b.rarityScore * b.leverageScore) - (a.rarityScore * a.leverageScore))
    .slice(0, 5);

  const clusters = [...new Set(strengths.flatMap((s) => s.capability.toLowerCase().split(/[,;]/).map((c) => c.trim())))];

  const employerVersions: Record<string, string> = {};
  for (const s of strengths) {
    if (s.employerInterpretation) {
      employerVersions[s.capability] = s.employerInterpretation;
    }
  }

  return {
    strengths,
    topStrengths,
    totalRarityScore: strengths.reduce((sum, s) => sum + s.rarityScore, 0) / strengths.length,
    totalProofDensity: strengths.reduce((sum, s) => sum + s.matchConfidence, 0) / strengths.length,
    strongestCapabilityClusters: clusters.slice(0, 10),
    employerLanguageVersions: employerVersions,
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

function toRecord(val: unknown): Record<string, string> {
  if (val && typeof val === 'object') {
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(val)) {
      if (typeof v === 'string') result[k] = v;
    }
    return result;
  }
  return {};
}

function toIntOrNull(val: unknown): number | null {
  return typeof val === 'number' ? Math.round(val) : null;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
