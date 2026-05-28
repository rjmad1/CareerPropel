/**
 * Validation and parsing for job deconstruction LLM output.
 * Extracts JSON from LLM responses, validates structure, and
 * returns typed JobDeconstructionResult.
 */

import { RoleArchetype } from '@prisma/client';
import { createLogger } from '@/lib/logging/logger';
import type { JobDeconstructionResult, InferredRole, DeconstructedRequirement, BusinessProblemInference, OperationalSignal } from '@/lib/fit-engine/types';
import { MIN_CONFIDENCE } from '@/lib/fit-engine/constants';

const logger = createLogger({ component: 'fit-engine:deconstruction-validation' });

/**
 * Parse the raw LLM response into a structured JobDeconstructionResult.
 * Handles various response formats and provides graceful fallbacks.
 */
export function parseDeconstructionResponse(rawResponse: string): JobDeconstructionResult {
  // Extract JSON from response (handle code fences, extra text, etc.)
  const jsonStr = extractJson(rawResponse);
  if (!jsonStr) {
    throw new Error('No valid JSON found in LLM response for job deconstruction');
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new Error(`Failed to parse deconstruction JSON: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Validate and normalize
  const validated = validateDeconstructionResult(parsed);

  return validated;
}

/**
 * Extract JSON from LLM response — handles various formats.
 */
function extractJson(text: string): string | null {
  // Try pure JSON first
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  // Try extracting from code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const content = fenceMatch[1].trim();
    if (content.startsWith('{') && content.endsWith('}')) {
      return content;
    }
  }

  // Try finding JSON with regex (first { to last })
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return null;
}

/**
 * Validate and normalize the parsed deconstruction result.
 * Fills in defaults for missing fields and validates critical data.
 */
export function validateDeconstructionResult(raw: Record<string, unknown>): JobDeconstructionResult {
  const errors: string[] = [];

  // Inferred role
  const inferredRole = validateInferredRole(raw.inferredRole as Record<string, unknown> | undefined, errors);

  // Hard requirements
  const hardRequirements = Array.isArray(raw.hardRequirements)
    ? (raw.hardRequirements as Record<string, unknown>[]).map((r) => validateRequirement(r, 'hard', errors))
    : [];

  // Soft requirements
  const softRequirements = Array.isArray(raw.softRequirements)
    ? (raw.softRequirements as Record<string, unknown>[]).map((r) => validateRequirement(r, 'soft', errors))
    : [];

  // Business problems
  const businessProblems = Array.isArray(raw.businessProblems)
    ? (raw.businessProblems as Record<string, unknown>[]).map((bp) => validateBusinessProblem(bp, errors))
    : [];

  // Operational signals
  const operationalSignals = Array.isArray(raw.operationalSignals)
    ? (raw.operationalSignals as Record<string, unknown>[]).map((s) => validateOperationalSignal(s, errors))
    : [];

  // Recurring responsibilities
  const recurringResponsibilities = Array.isArray(raw.recurringResponsibilities)
    ? (raw.recurringResponsibilities as Array<{ responsibility?: string; frequency?: number; weight?: number }>).map((r) => ({
        responsibility: r.responsibility || 'Unknown',
        frequency: clamp(r.frequency ?? 0.5, 0, 1),
        weight: clamp(r.weight ?? 0.5, 0, 1),
      }))
    : [];

  // Scalar fields
  const executionComplexity = clamp(typeof raw.executionComplexity === 'number' ? raw.executionComplexity : 5, 1, 10);
  const organizationalLeverage = clamp(typeof raw.organizationalLeverage === 'number' ? raw.organizationalLeverage : 5, 1, 10);

  if (errors.length > 0) {
    logger.warn({ errors }, 'Deconstruction validation warnings');
  }

  return {
    inferredRole,
    hardRequirements,
    softRequirements,
    businessProblems,
    operationalSignals,
    operationalDomain: ensureString(raw.operationalDomain, 'General'),
    recurringResponsibilities,
    decisionOwnership: ensureStringArray(raw.decisionOwnership, []),
    operationalScope: ensureString(raw.operationalScope, ''),
    executionComplexity,
    systemsResponsibility: ensureStringOrNull(raw.systemsResponsibility),
    crossFunctionalCoordination: ensureStringOrNull(raw.crossFunctionalCoordination),
    reportingStructure: validateReportingStructure(raw.reportingStructure),
    organizationalLeverage,
    rawJdText: '', // filled by caller
  };
}

function validateInferredRole(raw: Record<string, unknown> | undefined, errors: string[]): InferredRole {
  if (!raw) {
    errors.push('Missing inferredRole');
    return {
      title: 'Unknown Role',
      archetype: 'EXECUTOR' as RoleArchetype,
      archetypeWeights: { EXECUTOR: 1.0 } as Record<RoleArchetype, number>,
      clarityScore: 0.5,
      reasoning: 'Fallback — LLM did not provide inferred role',
    };
  }

  const validArchetypes: RoleArchetype[] = [
    'BUILDER', 'OPERATOR', 'STRATEGIST', 'MAINTAINER', 'OPTIMIZER',
    'RESEARCHER', 'EXECUTOR', 'PROCESS_SCALER', 'SYSTEMS_INTEGRATOR',
    'CUSTOMER_FACING_TRANSLATOR', 'TECHNICAL_LEAD', 'TRANSFORMATION_DRIVER',
  ];

  const archetype = validArchetypes.includes(raw.archetype as RoleArchetype)
    ? (raw.archetype as RoleArchetype)
    : 'EXECUTOR' as RoleArchetype;

  // Normalize weights to sum to 1.0
  const rawWeights = (raw.archetypeWeights as Record<string, number>) || {};
  const archetypeWeights = {} as Record<RoleArchetype, number>;
  let sum = 0;
  for (const a of validArchetypes) {
    const w = clamp(rawWeights[a] ?? (a === archetype ? 1 : 0), 0, 1);
    archetypeWeights[a] = w;
    sum += w;
  }
  if (sum > 0) {
    for (const a of validArchetypes) {
      archetypeWeights[a] = clamp(archetypeWeights[a] / sum, 0, 1);
    }
  } else {
    archetypeWeights[archetype] = 1.0;
  }

  return {
    title: ensureString(raw.title, 'Unknown Role'),
    archetype,
    archetypeWeights,
    clarityScore: clamp(typeof raw.clarityScore === 'number' ? raw.clarityScore : 0.5, 0, 1),
    reasoning: ensureString(raw.reasoning, ''),
  };
}

function validateRequirement(raw: Record<string, unknown>, defaultClassification: string, _errors: string[]): DeconstructedRequirement {
  return {
    requirement: ensureString(raw.requirement, 'Unknown requirement'),
    classification: ['hard', 'soft', 'wishlist'].includes(raw.classification as string)
      ? (raw.classification as 'hard' | 'soft' | 'wishlist')
      : defaultClassification as 'hard' | 'soft',
    confidenceScore: clamp(typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0.5, 0, 1),
    tools: ensureStringArray(raw.tools, []),
    decisions: ensureStringArray(raw.decisions, []),
    outputs: ensureStringArray(raw.outputs, []),
    metrics: ensureStringArray(raw.metrics, []),
    ownership: ensureString(raw.ownership, ''),
    operationalComplexity: clamp(typeof raw.operationalComplexity === 'number' ? raw.operationalComplexity : 5, 1, 10),
    collaborationSurface: ensureStringArray(raw.collaborationSurface, []),
    businessImpact: ensureStringOrNull(raw.businessImpact),
    executionCadence: ensureStringOrNull(raw.executionCadence),
    riskLevel: clamp(typeof raw.riskLevel === 'number' ? raw.riskLevel : 5, 1, 10),
  };
}

function validateBusinessProblem(raw: Record<string, unknown>, _errors: string[]): BusinessProblemInference {
  return {
    problem: ensureString(raw.problem, 'Unknown problem'),
    category: ensureString(raw.category, 'general'),
    severity: clamp(typeof raw.severity === 'number' ? raw.severity : 5, 1, 10),
    urgencySignal: ensureStringOrNull(raw.urgencySignal),
    operationalFriction: ensureStringOrNull(raw.operationalFriction),
    scalingChallenge: ensureStringOrNull(raw.scalingChallenge),
    executionBottleneck: ensureStringOrNull(raw.executionBottleneck),
    evidence: ensureStringOrNull(raw.evidence),
  };
}

function validateOperationalSignal(raw: Record<string, unknown>, _errors: string[]): OperationalSignal {
  return {
    signal: ensureString(raw.signal, 'Unknown signal'),
    signalType: ensureString(raw.signalType, 'recurring_responsibility'),
    frequency: clamp(typeof raw.frequency === 'number' ? raw.frequency : 0.5, 0, 1),
    weight: clamp(typeof raw.weight === 'number' ? raw.weight : 0.5, 0, 1),
    sourceCompanies: ensureStringArray(raw.sourceCompanies, []),
  };
}

function validateReportingStructure(raw: unknown): JobDeconstructionResult['reportingStructure'] {
  if (!raw || typeof raw !== 'object') return null;
  const rs = raw as Record<string, unknown>;
  return {
    reportsTo: ensureStringOrNull(rs.reportsTo),
    manages: ensureStringArray(rs.manages, []),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ensureString(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  return fallback;
}

function ensureStringOrNull(val: unknown): string | null {
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  return null;
}

function ensureStringArray(val: unknown, fallback: string[]): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string').map((s) => s.trim()).filter(Boolean);
  return fallback;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
