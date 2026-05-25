import { prisma } from '@/lib/db';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';
import type { AgentType } from '@/lib/agents/prompts';
import { findCachedExecution } from './ai-coordinator';
import { createApprovalRequest } from './approval-manager';
import type {
  WorkflowStepDefinition,
  WorkflowContext,
  StepResult,
  ApprovalPayload,
} from './types';

const AGENT_POLL_TIMEOUT_MS = 120_000; // 2 minutes max poll
const AGENT_POLL_INTERVAL_MS = 3_000;

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

    if (!exec) return { status: 'failed', output: null };

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

  // Static overrides from template definition
  if (step.contextOverrides) {
    Object.assign(base, step.contextOverrides);
  }

  // Pull values from prior step outputs
  if (step.contextFromSteps) {
    for (const [targetKey, sourcePath] of Object.entries(step.contextFromSteps)) {
      // sourcePath is like 'research_company.cultureSummary'
      // The step output is stored in wfContext under the step key
      const [stepKey, ...fieldParts] = sourcePath.split('.');
      const stepOutput = wfContext[stepKey];
      if (stepOutput && typeof stepOutput === 'object') {
        const value = getNestedValue(stepOutput as Record<string, unknown>, fieldParts.join('.'));
        if (value !== undefined) {
          base[targetKey] = typeof value === 'string' ? value : JSON.stringify(value);
        }
      }
    }
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
 * Execute a single workflow step. Returns a StepResult.
 */
export async function executeStep(
  step: WorkflowStepDefinition,
  wfContext: WorkflowContext,
  workflowId: string,
): Promise<StepResult> {
  switch (step.type) {
    case 'agent_call': {
      if (!step.agentType) {
        return { success: false, error: `Step ${step.key} missing agentType` };
      }

      const agentType = step.agentType as AgentType;
      const stepContext = buildStepContext(step, wfContext);

      // Check coordinator cache first
      const cached = await findCachedExecution(wfContext.userId, agentType, wfContext.jobId);
      if (cached) {
        return {
          success: true,
          output: cached.output,
          agentExecutionId: cached.executionId,
        };
      }

      // Enqueue and wait
      let executionId: string;
      try {
        executionId = await enqueueAgentExecution(agentType, wfContext.userId, stepContext);
      } catch (err: any) {
        if (step.optional) return { success: true, skipped: true };
        return { success: false, error: err.message };
      }

      const result = await waitForAgentExecution(executionId);

      if (result.status !== 'completed') {
        if (step.optional) return { success: true, skipped: true, agentExecutionId: executionId };
        return { success: false, error: `Agent ${agentType} ${result.status}`, agentExecutionId: executionId };
      }

      return { success: true, output: result.output ?? {}, agentExecutionId: executionId };
    }

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
      // Publish a Redis notification event
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

    case 'delay': {
      // Delays are handled by the engine via BullMQ delayed jobs, not here
      // The step executor just records the intent
      return {
        success: true,
        output: {
          delayMs: step.delayMs ?? 0,
          resumeAt: new Date(Date.now() + (step.delayMs ?? 0)).toISOString(),
        },
      };
    }

    default:
      return { success: false, error: `Unknown step type: ${(step as any).type}` };
  }
}
