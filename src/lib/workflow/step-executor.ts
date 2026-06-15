import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';
import type { AgentType } from '@/lib/agents/prompts';
import { findCachedExecution } from './ai-coordinator';
import { createApprovalRequest } from './approval-manager';
import { ValidationCritic } from '@/lib/orchestration/critic';
import type {
  WorkflowStepDefinition,
  WorkflowContext,
  StepResult,
  ApprovalPayload,
} from './types';

const AGENT_POLL_TIMEOUT_MS = 120_000; // 2 minutes max poll
const AGENT_POLL_INTERVAL_MS = 3_000;

/**
 * Error codes that should propagate as failures even when the step is optional.
 * Transient / retriable errors are excluded so optional steps can be skipped gracefully.
 */
const FATAL_ERROR_CODES = new Set(['COST_CEILING_EXCEEDED']);

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Poll DB until AgentExecution reaches a terminal state.
 */
async function waitForAgentExecution(executionId: string): Promise<{
  status: string;
  output: Record<string, unknown> | null;
}> {
  const deadline = Date.now() + AGENT_POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    const exec = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      select: { status: true, output: true },
    });

    if (!exec) {
      log.warn({ executionId }, 'waitForAgentExecution: execution record not found');
      return { status: 'not_found', output: null };
    }

    if (exec.status === 'completed') {
      try {
        const output = exec.output ? (JSON.parse(exec.output) as Record<string, unknown>) : {};
        return { status: 'completed', output };
      } catch {
        return { status: 'completed', output: {} };
      }
    }

    if (exec.status === 'failed' || exec.status === 'interrupted') {
      return { status: exec.status, output: null };
    }

    await new Promise(r => setTimeout(r, AGENT_POLL_INTERVAL_MS));
  }

  return { status: 'timeout', output: null };
}

/**
 * Extract a nested value from an object using dot notation.
 * e.g. get(obj, 'research_company.cultureSummary')
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && !Array.isArray(acc)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Resolve contextFromSteps entries into the base context object.
 * Extracted to keep buildStepContext within cognitive-complexity limits.
 */
function applyContextFromSteps(
  base: Record<string, unknown>,
  contextFromSteps: Record<string, string>,
  wfContext: WorkflowContext,
): void {
  for (const [targetKey, sourcePath] of Object.entries(contextFromSteps)) {
    const [stepKey, ...fieldParts] = sourcePath.split('.');
    const stepOutput = wfContext[stepKey];
    if (!stepOutput || typeof stepOutput !== 'object') continue;
    const value = getNestedValue(stepOutput as Record<string, unknown>, fieldParts.join('.'));
    if (value === undefined) continue;
    // Preserve primitive types (number, boolean, null); only stringify objects/arrays.
    base[targetKey] = (typeof value === 'object' && value !== null)
      ? JSON.stringify(value)
      : value;
  }
}

/**
 * Build the agent context for a step, merging workflow context + step overrides + context-from-steps.
 */
function buildStepContext(
  step: WorkflowStepDefinition,
  wfContext: WorkflowContext,
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    jobId: wfContext.jobId,
    companyName: wfContext.companyName,
    jobTitle: wfContext.jobTitle,
    userId: wfContext.userId,
  };

  if (step.contextOverrides) {
    Object.assign(base, step.contextOverrides);
  }

  if (step.contextFromSteps) {
    applyContextFromSteps(base, step.contextFromSteps, wfContext);
  }

  return base;
}

/**
 * Build the approval payload for an approval step.
 */
function buildApprovalPayload(
  step: WorkflowStepDefinition,
  wfContext: WorkflowContext,
): ApprovalPayload {
  if (!step.approvalActionType) {
    throw new Error(`Step ${step.key} is missing approvalActionType`);
  }

  let sourceOutput: Record<string, unknown> = {};
  if (step.approvalPayloadSource) {
    const stepOutput = wfContext[step.approvalPayloadSource];
    if (stepOutput && typeof stepOutput === 'object') {
      sourceOutput = stepOutput as Record<string, unknown>;
    }
  }

  return {
    actionType: step.approvalActionType,
    subject: typeof sourceOutput.subject === 'string' ? sourceOutput.subject : undefined,
    body: typeof sourceOutput.body === 'string' ? sourceOutput.body : undefined,
    metadata: { stepKey: step.key, sourceOutput },
  };
}

/**
 * Handle the agent_call step type. Extracted to keep executeStep within complexity limits.
 */
async function executeAgentCallStep(
  step: WorkflowStepDefinition,
  wfContext: WorkflowContext,
): Promise<StepResult> {
  if (!step.agentType) {
    return { success: false, error: `Step ${step.key} missing agentType` };
  }

  const agentType: AgentType = step.agentType;
  const stepContext = buildStepContext(step, wfContext);

  // Check coordinator cache first
  const cached = await findCachedExecution(wfContext.userId, agentType, wfContext.jobId);
  if (cached) {
    return { success: true, output: cached.output, agentExecutionId: cached.executionId };
  }

  // Enqueue and wait
  let executionId: string;
  try {
    executionId = await enqueueAgentExecution(agentType, wfContext.userId, stepContext);
  } catch (err: unknown) {
    log.warn({ err, stepKey: step.key }, 'executeStep: enqueue failed');
    const errObj = err as { code?: string; message?: string };
    if (step.optional && !FATAL_ERROR_CODES.has(errObj.code ?? '')) {
      return { success: true, skipped: true };
    }
    return { success: false, error: errObj.message };
  }

  const result = await waitForAgentExecution(executionId);

  if (result.status === 'completed') {
    const output = result.output ?? {};
    
    // Wire the ValidationCritic audit loop
    log.info({ stepKey: step.key, agentType }, 'Orchestration step execution: Auditing step output with ValidationCritic');
    const audit = await ValidationCritic.auditStepOutput(
      step.key,
      agentType,
      output,
      wfContext.userId
    );

    if (audit.passed) {
      return { success: true, output, agentExecutionId: executionId };
    }

    // ── Self-Correction Protocol ────────────────────────────────────────────
    log.warn(
      { stepKey: step.key, errors: audit.errors },
      'Critic audit failed. Initiating self-correction retry.'
    );

    const retryContext = {
      ...stepContext,
      criticFeedback: audit.errors.join('\n'),
    };

    let retryExecutionId: string;
    try {
      retryExecutionId = await enqueueAgentExecution(agentType, wfContext.userId, retryContext);
    } catch (err: unknown) {
      log.warn({ err, stepKey: step.key }, 'executeStep retry: enqueue failed');
      const errObj = err as { code?: string; message?: string };
      return {
        success: false,
        error: `Critic audit failed (${audit.errors.join('; ')}). Retry enqueue failed: ${errObj.message}`,
        agentExecutionId: executionId,
      };
    }

    const retryResult = await waitForAgentExecution(retryExecutionId);

    if (retryResult.status === 'completed') {
      const retryOutput = retryResult.output ?? {};
      const retryAudit = await ValidationCritic.auditStepOutput(
        step.key,
        agentType,
        retryOutput,
        wfContext.userId
      );

      if (retryAudit.passed) {
        log.info({ stepKey: step.key }, 'Critic audit passed after self-correction retry.');
        return { success: true, output: retryOutput, agentExecutionId: retryExecutionId };
      }

      log.error(
        { stepKey: step.key, errors: retryAudit.errors },
        'Critic audit failed again after self-correction retry.'
      );

      return {
        success: false,
        error: `Agent ${agentType} failed Critic audit after self-correction retry: ${retryAudit.errors.join('; ')}`,
        agentExecutionId: retryExecutionId,
      };
    }

    return {
      success: false,
      error: `Agent ${agentType} retry failed with status: ${retryResult.status}. Initial audit errors: ${audit.errors.join('; ')}`,
      agentExecutionId: retryExecutionId,
    };
  }

  if (step.optional && result.status === 'not_found') {
    // Record was never persisted — treat as skipped rather than a real failure.
    return { success: true, skipped: true, agentExecutionId: executionId };
  }

  // 'failed', 'timeout', 'interrupted', or any unexpected status — surface as a failure
  // even for optional steps so real errors are not silently swallowed.
  return { success: false, error: `Agent ${agentType} ${result.status}`, agentExecutionId: executionId };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Execute a single workflow step. Returns a StepResult.
 */
export async function executeStep(
  step: WorkflowStepDefinition,
  wfContext: WorkflowContext,
  workflowId: string,
): Promise<StepResult> {
  switch (step.type) {
    case 'agent_call':
      return executeAgentCallStep(step, wfContext);

    case 'approval': {
      const payload = buildApprovalPayload(step, wfContext);
      const approvalId = await createApprovalRequest({
        workflowId,
        stepKey: step.key,
        candidateId: wfContext.candidateId,
        actionType: step.approvalActionType!,
        payload,
        rationale: step.approvalRationale,
      });
      return {
        success: false, // signals engine to halt
        approvalRequestId: approvalId,
        output: { approvalId, status: 'pending' },
      };
    }

    case 'condition': {
      if (!step.conditionField) {
        return { success: true, output: { branch: 'true' }, nextStepKey: step.trueBranch };
      }
      const fieldValue = wfContext[step.conditionField];
      const isTruthy = Boolean(fieldValue);
      return {
        success: true,
        output: { branch: isTruthy ? 'true' : 'false', fieldValue },
        nextStepKey: isTruthy ? step.trueBranch : step.falseBranch,
      };
    }

    case 'notification': {
      try {
        const { redis } = await import('@/lib/redis/redisClient');
        await redis.publish(
          `workflow:notifications:${wfContext.candidateId}`,
          JSON.stringify({
            type: 'workflow:notification',
            workflowId,
            stepKey: step.key,
            message: step.notificationMessage ?? 'Workflow step completed',
            timestamp: new Date(),
          }),
        );
      } catch {
        // Non-fatal
      }
      return { success: true, output: { notified: true } };
    }

    case 'delay':
      // Delays are handled by the engine via BullMQ delayed jobs; executor just records the intent.
      return {
        success: true,
        output: {
          delayMs: step.delayMs ?? 0,
          resumeAt: new Date(Date.now() + (step.delayMs ?? 0)).toISOString(),
        },
      };

    default: {
      // After exhausting all StepType cases, step.type is `never`; cast through string for the error message.
      const unknownType = step.type as unknown as string;
      return { success: false, error: `Unknown step type: ${unknownType}` };
    }
  }
}
