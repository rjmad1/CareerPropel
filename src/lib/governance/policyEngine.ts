/**
 * AI Capability Governance Policy Engine
 * Central, configurable policies for: cost, retries, fallback depth,
 * allowed tools, context/output size, PII handling.
 */

import { AgentType } from '@/lib/agents/prompts';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'policy-engine' });

// ─── Policy definitions ───────────────────────────────────────────────────────

export interface AgentPolicy {
  /** Max total token spend per single execution */
  maxTokensPerExecution: number;
  /** Estimated max cost USD per execution */
  maxCostUsdPerExecution: number;
  /** Max retry attempts (queue-level) */
  maxRetries: number;
  /** Max provider fallback depth */
  maxFallbackDepth: number;
  /** Allowed tool names (empty = none) */
  allowedTools: string[];
  /** Max input context size in characters */
  maxInputContextChars: number;
  /** Max output size in characters */
  maxOutputChars: number;
  /** How PII in input is handled */
  piiHandling: 'redact' | 'passthrough' | 'reject';
  /** Execution TTL in seconds */
  executionTtlSeconds: number;
  /** Max concurrent executions per user for this agent type */
  maxConcurrentPerUser: number;
  /** Whether the output must pass all validation layers to persist */
  requireValidationPass: boolean;
  /** Whether hallucination check failure blocks persistence */
  blockOnHallucinationRisk: boolean;
}

// ─── Default policies ─────────────────────────────────────────────────────────

const DEFAULT_POLICY: AgentPolicy = {
  maxTokensPerExecution: 8192,
  maxCostUsdPerExecution: 0.10,
  maxRetries: 3,
  maxFallbackDepth: 2,
  allowedTools: [],
  maxInputContextChars: 20000,
  maxOutputChars: 50000,
  piiHandling: 'redact',
  executionTtlSeconds: 900,
  maxConcurrentPerUser: 3,
  requireValidationPass: false,  // warn but allow on validation failure
  blockOnHallucinationRisk: true,
};

export const AGENT_POLICIES: Record<AgentType, AgentPolicy> = {
  'interview-prep': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 12000,
    maxCostUsdPerExecution: 0.20,
    maxInputContextChars: 30000,
    maxOutputChars: 80000,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'research': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 10000,
    maxCostUsdPerExecution: 0.15,
    maxInputContextChars: 25000,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
    piiHandling: 'redact',
  },
  'resume-tailor': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    maxRetries: 4,
    requireValidationPass: false,
    blockOnHallucinationRisk: false,
  },
  'job-match': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 5000,
    maxCostUsdPerExecution: 0.08,
    requireValidationPass: false,
    blockOnHallucinationRisk: false,
  },
  'networking': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,  // manipulation detection
  },
  'follow-up': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 4000,
    maxCostUsdPerExecution: 0.06,
    maxInputContextChars: 10000,
    requireValidationPass: false,
    blockOnHallucinationRisk: false,
  },
  'role-intelligence': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 8000,
    maxCostUsdPerExecution: 0.15,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'fit-analysis': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 8000,
    maxCostUsdPerExecution: 0.15,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'strength-mapper': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'conversion-scorer': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'gap-analyzer': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
  'pattern-miner': {
    ...DEFAULT_POLICY,
    maxTokensPerExecution: 6000,
    maxCostUsdPerExecution: 0.10,
    requireValidationPass: true,
    blockOnHallucinationRisk: true,
  },
};

export function getPolicy(agentType: AgentType): AgentPolicy {
  return AGENT_POLICIES[agentType] ?? DEFAULT_POLICY;
}

// ─── Policy enforcement ───────────────────────────────────────────────────────

export interface PolicyViolation {
  policy: string;
  limit: number | string;
  actual: number | string;
  message: string;
}

export interface PolicyCheckResult {
  allowed: boolean;
  violations: PolicyViolation[];
}

export function checkExecutionPolicy(
  agentType: AgentType,
  opts: {
    inputChars?: number;
    outputChars?: number;
    tokenCount?: number;
    costUsd?: number;
    concurrentCount?: number;
    toolsUsed?: string[];
  },
): PolicyCheckResult {
  const policy = getPolicy(agentType);
  const violations: PolicyViolation[] = [];

  if (opts.inputChars !== undefined && opts.inputChars > policy.maxInputContextChars) {
    violations.push({
      policy: 'maxInputContextChars',
      limit: policy.maxInputContextChars,
      actual: opts.inputChars,
      message: `Input context (${opts.inputChars} chars) exceeds policy limit (${policy.maxInputContextChars})`,
    });
  }

  if (opts.outputChars !== undefined && opts.outputChars > policy.maxOutputChars) {
    violations.push({
      policy: 'maxOutputChars',
      limit: policy.maxOutputChars,
      actual: opts.outputChars,
      message: `Output (${opts.outputChars} chars) exceeds policy limit (${policy.maxOutputChars})`,
    });
  }

  if (opts.tokenCount !== undefined && opts.tokenCount > policy.maxTokensPerExecution) {
    violations.push({
      policy: 'maxTokensPerExecution',
      limit: policy.maxTokensPerExecution,
      actual: opts.tokenCount,
      message: `Token count (${opts.tokenCount}) exceeds policy limit (${policy.maxTokensPerExecution})`,
    });
  }

  if (opts.costUsd !== undefined && opts.costUsd > policy.maxCostUsdPerExecution) {
    violations.push({
      policy: 'maxCostUsdPerExecution',
      limit: policy.maxCostUsdPerExecution,
      actual: opts.costUsd,
      message: `Estimated cost ($${opts.costUsd.toFixed(4)}) exceeds policy limit ($${policy.maxCostUsdPerExecution})`,
    });
  }

  if (opts.concurrentCount !== undefined && opts.concurrentCount >= policy.maxConcurrentPerUser) {
    violations.push({
      policy: 'maxConcurrentPerUser',
      limit: policy.maxConcurrentPerUser,
      actual: opts.concurrentCount,
      message: `Concurrent executions (${opts.concurrentCount}) at policy limit (${policy.maxConcurrentPerUser})`,
    });
  }

  if (opts.toolsUsed && opts.toolsUsed.length > 0 && policy.allowedTools.length === 0) {
    violations.push({
      policy: 'allowedTools',
      limit: 'none',
      actual: opts.toolsUsed.join(','),
      message: `Tool usage not permitted for agent type '${agentType}'`,
    });
  } else if (opts.toolsUsed) {
    const unauthorized = opts.toolsUsed.filter((t) => !policy.allowedTools.includes(t));
    for (const tool of unauthorized) {
      violations.push({
        policy: 'allowedTools',
        limit: policy.allowedTools.join(',') || 'none',
        actual: tool,
        message: `Tool '${tool}' not in allowed list for agent '${agentType}'`,
      });
    }
  }

  const allowed = violations.length === 0;
  if (!allowed) {
    log.warn({ agentType, violations }, 'Policy check failed');
  }

  return { allowed, violations };
}

/** Estimate USD cost from token counts using published per-token rates. */
export function estimateCostUsd(_provider: string, modelId: string, inputTokens: number, outputTokens: number): number {
  // Rates in USD per 1M tokens (approximate, subject to change)
  const rates: Record<string, { input: number; output: number }> = {
    'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
    'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
    'claude-opus-4-7': { input: 15.0, output: 75.0 },
    'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
    'meta/llama-3.1-405b-instruct': { input: 5.0, output: 16.0 },
    'meta/llama-3.1-70b-instruct': { input: 0.9, output: 0.9 },
  };

  const rate = rates[modelId] ?? { input: 3.0, output: 15.0 };
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000;
}
