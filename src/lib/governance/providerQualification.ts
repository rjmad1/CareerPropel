/**
 * Provider Qualification Framework
 * Capability matrices: enforces which providers/models are allowed per agent type.
 * Rejects unsupported provider/capability combinations before LLM dispatch.
 */

import { AgentType } from '@/lib/agents/prompts/prompts';
import { LLMProviderName } from '@/lib/llm/provider';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'provider-qualification' });

export type ModelTier = 'frontier' | 'standard' | 'economy';

export interface ProviderCapabilitySpec {
  allowedProviders: LLMProviderName[];
  /** Minimum model tier required */
  minModelTier: ModelTier;
  /** Rationale for the restriction */
  rationale: string;
  /** Whether hallucination-low models are required */
  requiresLowHallucination: boolean;
  /** Whether high factuality is required (salary, company data) */
  requiresHighFactuality: boolean;
}

// ─── Qualification Matrix ────────────────────────────────────────────────────

export const AGENT_CAPABILITY_MATRIX: Record<AgentType, ProviderCapabilitySpec> = {
  'interview-prep': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Interview prep generates behavioral guidance and company intel; requires highest-quality reasoning',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'research': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Company research outputs may influence high-stakes career decisions; requires factual accuracy',
    requiresLowHallucination: true,
    requiresHighFactuality: true,
  },
  'job-match': {
    allowedProviders: ['anthropic', 'nvidia-nim'],
    minModelTier: 'standard',
    rationale: 'Scoring alignment is analytical; standard models acceptable with validation',
    requiresLowHallucination: false,
    requiresHighFactuality: false,
  },
  'resume-tailor': {
    allowedProviders: ['anthropic', 'nvidia-nim'],
    minModelTier: 'standard',
    rationale: 'Resume tailoring is largely rewriting; standard models acceptable',
    requiresLowHallucination: false,
    requiresHighFactuality: false,
  },
  'networking': {
    allowedProviders: ['anthropic'],
    minModelTier: 'standard',
    rationale: 'Networking messages must not contain manipulative language; requires governed output',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'follow-up': {
    allowedProviders: ['anthropic', 'nvidia-nim'],
    minModelTier: 'standard',
    rationale: 'Follow-up drafts are templated; standard models acceptable',
    requiresLowHallucination: false,
    requiresHighFactuality: false,
  },
  'role-intelligence': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Deconstructing role operational requirements requires the highest reasoning capability',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'fit-analysis': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Mapping user proof to business pain points requires high-quality reasoning',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'strength-mapper': {
    allowedProviders: ['anthropic', 'nvidia-nim'],
    minModelTier: 'standard',
    rationale: 'Synthesizing strengths from history is standard rewrite/synthesis task',
    requiresLowHallucination: false,
    requiresHighFactuality: false,
  },
  'conversion-scorer': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Deterministic 11-dimension scoring and validation requires high logic fidelity',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'gap-analyzer': {
    allowedProviders: ['anthropic'],
    minModelTier: 'frontier',
    rationale: 'Gap classification and learning curve risk scoring requires precise reasoning',
    requiresLowHallucination: true,
    requiresHighFactuality: false,
  },
  'pattern-miner': {
    allowedProviders: ['anthropic', 'nvidia-nim'],
    minModelTier: 'standard',
    rationale: 'Mining keywords and correlation patterns is structural synthesis',
    requiresLowHallucination: false,
    requiresHighFactuality: false,
  },
};

// ─── Model tier registry ──────────────────────────────────────────────────────

const MODEL_TIER_MAP: Record<string, ModelTier> = {
  // Anthropic
  'claude-opus-4-7': 'frontier',
  'claude-sonnet-4-6': 'frontier',
  'claude-3-5-sonnet-20241022': 'frontier',
  'claude-3-5-haiku-20241022': 'standard',
  'claude-haiku-4-5-20251001': 'standard',
  // Nvidia NIM (mapped generically)
  'meta/llama-3.1-405b-instruct': 'frontier',
  'meta/llama-3.1-70b-instruct': 'standard',
  'meta/llama-3.1-8b-instruct': 'economy',
  'mistralai/mistral-large-2-instruct': 'standard',
};

const TIER_ORDER: Record<ModelTier, number> = { frontier: 2, standard: 1, economy: 0 };

export function getModelTier(modelId: string): ModelTier {
  return MODEL_TIER_MAP[modelId] ?? 'economy';
}

// ─── Qualification check ──────────────────────────────────────────────────────

export interface QualificationResult {
  qualified: boolean;
  reason?: string;
  spec: ProviderCapabilitySpec;
}

export function qualifyProvider(
  agentType: AgentType,
  provider: LLMProviderName,
  modelId: string,
): QualificationResult {
  const spec = AGENT_CAPABILITY_MATRIX[agentType];

  if (!spec.allowedProviders.includes(provider)) {
    const reason = `Provider '${provider}' is not qualified for agent '${agentType}'. Allowed: ${spec.allowedProviders.join(', ')}. Rationale: ${spec.rationale}`;
    log.warn({ agentType, provider, modelId, reason }, 'Provider qualification rejected');
    return { qualified: false, reason, spec };
  }

  const modelTier = getModelTier(modelId);
  if (TIER_ORDER[modelTier] < TIER_ORDER[spec.minModelTier]) {
    const reason = `Model '${modelId}' (tier: ${modelTier}) is below minimum required tier '${spec.minModelTier}' for agent '${agentType}'`;
    log.warn({ agentType, provider, modelId, modelTier, required: spec.minModelTier, reason }, 'Model tier qualification rejected');
    return { qualified: false, reason, spec };
  }

  return { qualified: true, spec };
}

/** Throws if provider+model is not qualified for the agent type. */
export function assertQualified(
  agentType: AgentType,
  provider: LLMProviderName,
  modelId: string,
): void {
  const result = qualifyProvider(agentType, provider, modelId);
  if (!result.qualified) {
    throw new QualificationError(result.reason!, agentType, provider, modelId);
  }
}

export class QualificationError extends Error {
  constructor(
    message: string,
    public readonly agentType: AgentType,
    public readonly provider: LLMProviderName,
    public readonly modelId: string,
  ) {
    super(message);
    this.name = 'QualificationError';
  }
}

/** Score a provider for a given agent type (higher = more preferred). */
export function scoreProvider(
  agentType: AgentType,
  provider: LLMProviderName,
  modelId: string,
): number {
  const spec = AGENT_CAPABILITY_MATRIX[agentType];
  if (!spec.allowedProviders.includes(provider)) return -1;

  const modelTier = getModelTier(modelId);
  const tierScore = TIER_ORDER[modelTier];

  // Prefer frontier for hallucination-sensitive tasks
  const hallucinationBonus = spec.requiresLowHallucination && modelTier === 'frontier' ? 10 : 0;
  const factualityBonus = spec.requiresHighFactuality && modelTier === 'frontier' ? 10 : 0;

  return tierScore + hallucinationBonus + factualityBonus;
}
