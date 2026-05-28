/**
 * Multi-Agent Coordination Foundation
 * Execution isolation, bounded context passing, tool invocation governance,
 * concurrency governance, recursion prevention, orchestration safeguards.
 *
 * This is a preparatory foundation — not yet wiring autonomous loops.
 * It establishes the primitives that future chained orchestration will depend on.
 */

import crypto from 'crypto';
import {
  ExecutionBoundary,
  createExecutionBoundary,
  deriveChildBoundary,
  assertBoundaryAllowsChild,
} from './boundedExecution';
import { AgentType } from '@/lib/agents/prompts';
import { getPolicy } from './policyEngine';
import { createLogger } from '@/lib/logging/logger';

const log = createLogger({ component: 'multi-agent-coordination' });

// ─── Orchestration Plan ───────────────────────────────────────────────────────

export interface AgentStep {
  stepId: string;
  agentType: AgentType;
  /** Input keys to pass from parent context or prior step outputs */
  inputMapping: Record<string, string>;
  /** Whether this step can run in parallel with adjacent steps */
  canParallelize: boolean;
  /** Max tokens allocated to this step */
  tokenBudget: number;
}

export interface OrchestrationPlan {
  planId: string;
  userId: string;
  steps: AgentStep[];
  /** Max total tokens for the entire plan */
  totalTokenBudget: number;
  /** Whether any step can spawn further children (default: false) */
  allowNestedOrchestration: boolean;
}

export interface OrchestrationContext {
  planId: string;
  boundary: ExecutionBoundary;
  completedSteps: Map<string, Record<string, unknown>>;
  remainingBudget: number;
}

// ─── Plan validation ──────────────────────────────────────────────────────────

export interface PlanValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateOrchestrationPlan(plan: OrchestrationPlan): PlanValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (plan.steps.length === 0) {
    errors.push('Plan has no steps');
  }

  if (plan.steps.length > 10) {
    errors.push(`Plan has ${plan.steps.length} steps; maximum allowed is 10`);
  }

  const stepIds = plan.steps.map((s) => s.stepId);
  const duplicates = stepIds.filter((id, i) => stepIds.indexOf(id) !== i);
  if (duplicates.length > 0) {
    errors.push(`Duplicate step IDs: ${duplicates.join(', ')}`);
  }

  if (plan.allowNestedOrchestration) {
    warnings.push('Nested orchestration enabled: ensure recursion depth limits are respected');
  }

  // Check token budget feasibility
  const stepBudgetTotal = plan.steps.reduce((sum, s) => sum + s.tokenBudget, 0);
  if (stepBudgetTotal > plan.totalTokenBudget) {
    errors.push(`Sum of step token budgets (${stepBudgetTotal}) exceeds plan total budget (${plan.totalTokenBudget})`);
  }

  // Validate each step against agent policies
  for (const step of plan.steps) {
    const policy = getPolicy(step.agentType);
    if (step.tokenBudget > policy.maxTokensPerExecution) {
      warnings.push(`Step '${step.stepId}' token budget (${step.tokenBudget}) exceeds policy limit for '${step.agentType}' (${policy.maxTokensPerExecution})`);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

// ─── Orchestration Context ────────────────────────────────────────────────────

export function createOrchestrationContext(plan: OrchestrationPlan): OrchestrationContext {
  const traceId = crypto.randomUUID();
  const boundary = createExecutionBoundary({
    traceId,
    userId: plan.userId,
    ttlMs: 1_800_000, // 30 min max for full orchestration plan
    maxDepth: plan.allowNestedOrchestration ? 3 : 1,
    tokenBudget: plan.totalTokenBudget,
  });

  return {
    planId: plan.planId,
    boundary,
    completedSteps: new Map(),
    remainingBudget: plan.totalTokenBudget,
  };
}

/** Prepare isolated context for a single step within an orchestration. */
export function isolateStepContext(
  orchestrationCtx: OrchestrationContext,
  step: AgentStep,
  stepExecutionId: string,
): ExecutionBoundary {
  assertBoundaryAllowsChild(
    orchestrationCtx.boundary,
    stepExecutionId,
    step.tokenBudget,
  );

  const childBoundary = deriveChildBoundary(orchestrationCtx.boundary, stepExecutionId);
  // Steps are isolated by default — they cannot spawn further children
  // unless the plan explicitly enables nested orchestration
  return { ...childBoundary, isolated: !orchestrationCtx.boundary.isolated };
}

/** Resolve input for a step from orchestration context + completed step outputs. */
export function resolveStepInput(
  step: AgentStep,
  initialContext: Record<string, string>,
  completedSteps: Map<string, Record<string, unknown>>,
): Record<string, string> {
  const resolved: Record<string, string> = {};

  for (const [inputKey, sourceRef] of Object.entries(step.inputMapping)) {
    if (sourceRef.startsWith('initial.')) {
      const key = sourceRef.slice('initial.'.length);
      resolved[inputKey] = initialContext[key] ?? '';
    } else if (sourceRef.includes('.')) {
      const [stepId, outputKey] = sourceRef.split('.', 2);
      const priorOutput = completedSteps.get(stepId);
      const value = priorOutput?.[outputKey];
      resolved[inputKey] = typeof value === 'string' ? value : JSON.stringify(value ?? '');
    } else {
      resolved[inputKey] = initialContext[sourceRef] ?? '';
    }
  }

  return resolved;
}

/** Record step completion and deduct from remaining budget. */
export function recordStepCompletion(
  ctx: OrchestrationContext,
  stepId: string,
  output: Record<string, unknown>,
  tokensUsed: number,
): void {
  ctx.completedSteps.set(stepId, output);
  ctx.remainingBudget = Math.max(0, ctx.remainingBudget - tokensUsed);
  log.debug({ planId: ctx.planId, stepId, tokensUsed, remainingBudget: ctx.remainingBudget }, 'Step completed');
}

// ─── Canary rollout helpers ───────────────────────────────────────────────────

/**
 * Determines whether a given execution should be routed to the canary prompt.
 * Uses a deterministic hash of userId + agentType so the same user gets consistent routing.
 */
export function isCanaryRoute(userId: string, agentType: AgentType, canaryPercent: number): boolean {
  if (canaryPercent <= 0) return false;
  if (canaryPercent >= 100) return true;
  // SHA-256 replaces MD5 (CWE-327 — MD5 is cryptographically broken)
  const hash = crypto.createHash('sha256').update(`${userId}:${agentType}`).digest('hex');
  const bucket = parseInt(hash.slice(0, 4), 16) % 100;
  return bucket < canaryPercent;
}
