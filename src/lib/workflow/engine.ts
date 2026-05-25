import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';
import { log } from '@/lib/logging/logger';
import { getTemplate } from './templates';
import { getWorkflowQueue, WORKFLOW_JOB_DEFAULTS, WORKFLOW_SCHEMA_VERSION } from './queue';
import { executeStep } from './step-executor';
import {
  getNextWorkflowStatus,
  isTerminalWorkflowStatus,
  isTerminalStepStatus,
} from './state-machine';
import { recordApprovalDecision } from './approval-manager';
import type {
  CreateWorkflowParams,
  WorkflowContext,
  ApprovalDecision,
  ApprovalPayload,
  WorkflowStatus,
} from './types';

const WORKFLOW_EVENT_CHANNEL = (candidateId: string) => `workflow:execution:${candidateId}`;

async function publishWorkflowEvent(
  candidateId: string,
  event: Record<string, unknown>,
): Promise<void> {
  try {
    await redis.publish(WORKFLOW_EVENT_CHANNEL(candidateId), JSON.stringify(event));
  } catch {
    // Non-fatal
  }
}

/**
 * Create a new workflow execution from a template.
 */
export async function createWorkflow(params: CreateWorkflowParams): Promise<string> {
  const { templateId, candidateId, userId, jobId, triggeredBy, contextOverrides } = params;

  const template = getTemplate(templateId);
  if (!template) throw Object.assign(new Error(`Template not found: ${templateId}`), { status: 404 });

  // Find or create a WorkflowDefinition for this template version.
  // We intentionally never update an existing definition record so that
  // in-flight executions referencing it see a stable steps snapshot.
  const existingDefinition = await prisma.workflowDefinition.findUnique({
    where: { name: template.id },
  });
  const definition = existingDefinition ?? await prisma.workflowDefinition.create({
    data: {
      name: template.id,
      displayName: template.displayName,
      description: template.description ?? null,
      version: template.version,
      steps: template.steps as any,
      metadata: template.metadata as any,
    },
  });

  // Fetch job context if jobId provided
  let jobContext: { company: string; title: string; stage: string } | null = null;
  if (jobId) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { company: true, title: true, stage: true },
    });
    jobContext = job ? { company: job.company, title: job.title, stage: job.stage } : null;
  }

  const initialContext: WorkflowContext = {
    userId,
    candidateId,
    jobId,
    companyName: jobContext?.company,
    jobTitle: jobContext?.title,
    jobStage: jobContext?.stage,
    ...contextOverrides,
  };

  // Create the execution record
  const execution = await prisma.workflowExecution.create({
    data: {
      candidateId,
      jobId: jobId ?? null,
      definitionId: definition.id,
      status: 'queued',
      currentStepIndex: 0,
      context: initialContext as any,
      triggeredBy: triggeredBy ?? 'user',
    },
  });

  // Create step execution records for all steps
  await prisma.workflowStepExecution.createMany({
    data: template.steps.map((step, index) => ({
      workflowId: execution.id,
      stepKey: step.key,
      stepIndex: index,
      stepType: step.type,
      status: 'pending' as const,
    })),
  });

  // Enqueue the first step
  await getWorkflowQueue().add(
    'workflow-step',
    {
      workflowExecutionId: execution.id,
      stepIndex: 0,
      userId,
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
    },
    WORKFLOW_JOB_DEFAULTS,
  );

  log.info({ workflowId: execution.id, templateId, candidateId }, 'Workflow created and queued');

  await publishWorkflowEvent(candidateId, {
    type: 'workflow:created',
    workflowId: execution.id,
    templateId,
    status: 'queued',
    timestamp: new Date(),
  });

  return execution.id;
}

/**
 * Advance a workflow by processing the current step.
 * Called by the BullMQ worker for each step.
 */
export async function advanceWorkflow(workflowExecutionId: string): Promise<void> {
  const wfLog = log.child({ workflowId: workflowExecutionId });

  // Fetch the execution with its current step
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowExecutionId },
    include: {
      definition: { select: { steps: true, name: true } },
      steps: { orderBy: { stepIndex: 'asc' } },
    },
  });

  if (!execution) {
    wfLog.error('Workflow execution not found');
    return;
  }

  if (isTerminalWorkflowStatus(execution.status as WorkflowStatus)) {
    wfLog.warn({ status: execution.status }, 'Workflow already in terminal state — skipping');
    return;
  }

  // Transition to running if queued
  if (execution.status === 'queued') {
    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: { status: 'running', startedAt: new Date() },
    });
  }

  const templateSteps = execution.definition.steps as any[];
  const currentIndex = execution.currentStepIndex;

  if (currentIndex >= templateSteps.length) {
    // All steps done
    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: { status: 'completed', completedAt: new Date() },
    });
    wfLog.info('Workflow completed');
    await publishWorkflowEvent(execution.candidateId, {
      type: 'workflow:completed',
      workflowId: workflowExecutionId,
      timestamp: new Date(),
    });
    return;
  }

  const stepDef = templateSteps[currentIndex];
  const stepExec = execution.steps.find(s => s.stepIndex === currentIndex);

  if (!stepExec) {
    wfLog.error({ stepIndex: currentIndex }, 'Step execution record not found');
    return;
  }

  // Extract userId from context early — needed by advanceToNextStep below.
  const wfContext = (execution.context ?? {}) as WorkflowContext;
  const contextUserId = wfContext.userId;

  // Skip already-completed or skipped steps
  if (isTerminalStepStatus(stepExec.status as any)) {
    await advanceToNextStep(workflowExecutionId, currentIndex, execution.candidateId, undefined, contextUserId);
    return;
  }

  // Mark step as running
  await prisma.workflowStepExecution.update({
    where: { id: stepExec.id },
    data: { status: 'running', startedAt: new Date() },
  });

  wfLog.info({ stepKey: stepDef.key, stepIndex: currentIndex }, 'Executing step');

  // Execute the step
  const result = await executeStep(stepDef, wfContext, workflowExecutionId);

  if (result.approvalRequestId) {
    // Step requires approval — halt workflow
    await prisma.workflowStepExecution.update({
      where: { id: stepExec.id },
      data: {
        status: 'waiting_for_approval',
        output: result.output as any,
        agentExecutionId: result.agentExecutionId ?? null,
      },
    });

    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: { status: 'waiting_for_approval' },
    });

    wfLog.info({ stepKey: stepDef.key, approvalId: result.approvalRequestId }, 'Workflow halted — awaiting approval');

    await publishWorkflowEvent(execution.candidateId, {
      type: 'workflow:waiting_for_approval',
      workflowId: workflowExecutionId,
      stepKey: stepDef.key,
      approvalRequestId: result.approvalRequestId,
      timestamp: new Date(),
    });
    return;
  }

  if (!result.success && !result.skipped) {
    // Step failed — check if optional
    if (stepDef.optional) {
      await prisma.workflowStepExecution.update({
        where: { id: stepExec.id },
        data: { status: 'skipped', errorMessage: result.error ?? 'Optional step skipped on failure' },
      });
      await advanceToNextStep(workflowExecutionId, currentIndex, execution.candidateId, undefined, contextUserId);
      return;
    }

    // Non-optional failure
    await prisma.workflowStepExecution.update({
      where: { id: stepExec.id },
      data: {
        status: 'failed',
        errorMessage: result.error ?? 'Step execution failed',
        completedAt: new Date(),
      },
    });

    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: `Step ${stepDef.key} failed: ${result.error}`,
      },
    });

    wfLog.error({ stepKey: stepDef.key, error: result.error }, 'Workflow failed');
    await publishWorkflowEvent(execution.candidateId, {
      type: 'workflow:failed',
      workflowId: workflowExecutionId,
      stepKey: stepDef.key,
      error: result.error,
      timestamp: new Date(),
    });
    return;
  }

  // Step succeeded (or was skipped)
  const newStatus = result.skipped ? 'skipped' : 'completed';

  await prisma.workflowStepExecution.update({
    where: { id: stepExec.id },
    data: {
      status: newStatus,
      output: result.output as any ?? null,
      agentExecutionId: result.agentExecutionId ?? null,
      completedAt: new Date(),
    },
  });

  // Merge step output into workflow context under step key
  const updatedContext: Record<string, unknown> = { ...wfContext };
  if (result.output) {
    updatedContext[stepDef.key] = result.output;
  }

  await prisma.workflowExecution.update({
    where: { id: workflowExecutionId },
    data: { context: updatedContext as any },
  });

  // Determine next step index
  let nextIndex = currentIndex + 1;

  // Handle condition branch jump
  if (stepDef.type === 'condition' && result.nextStepKey) {
    const jumpTo = templateSteps.findIndex((s: any) => s.key === result.nextStepKey);
    if (jumpTo !== -1) nextIndex = jumpTo;
  }

  // Handle delay steps — schedule with BullMQ delay
  if (stepDef.type === 'delay' && result.output?.delayMs) {
    const delayMs = result.output.delayMs as number;
    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: { currentStepIndex: nextIndex },
    });

    await getWorkflowQueue().add(
      'workflow-step',
      {
        workflowExecutionId,
        stepIndex: nextIndex,
        userId: wfContext.userId,
        schemaVersion: WORKFLOW_SCHEMA_VERSION,
      },
      { ...WORKFLOW_JOB_DEFAULTS, delay: delayMs },
    );

    wfLog.info({ delayMs, nextIndex }, 'Delay step — next step scheduled');
    return;
  }

  await advanceToNextStep(workflowExecutionId, currentIndex, execution.candidateId, nextIndex, wfContext.userId);
}

async function advanceToNextStep(
  workflowExecutionId: string,
  currentIndex: number,
  candidateId: string,
  nextIndex?: number,
  userId?: string,
): Promise<void> {
  // Re-fetch definition to know total step count
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowExecutionId },
    include: { definition: { select: { steps: true } }, steps: true },
  });

  if (!execution) return;

  const templateSteps = execution.definition.steps as any[];
  const resolvedNextIndex = nextIndex ?? currentIndex + 1;

  if (resolvedNextIndex >= templateSteps.length) {
    // All done
    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: { status: 'completed', completedAt: new Date(), currentStepIndex: resolvedNextIndex },
    });
    await publishWorkflowEvent(candidateId, {
      type: 'workflow:completed',
      workflowId: workflowExecutionId,
      timestamp: new Date(),
    });
    return;
  }

  const resolvedUserId = userId ?? ((execution.context as any)?.userId as string | undefined);

  if (!resolvedUserId) {
    await prisma.workflowExecution.update({
      where: { id: workflowExecutionId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: `advanceToNextStep: userId missing — cannot enqueue step ${resolvedNextIndex}`,
      },
    });
    log.error({ workflowExecutionId, resolvedNextIndex }, 'advanceToNextStep: userId missing — workflow failed');
    return;
  }

  await prisma.workflowExecution.update({
    where: { id: workflowExecutionId },
    data: { currentStepIndex: resolvedNextIndex },
  });

  // Enqueue next step immediately
  await getWorkflowQueue().add(
    'workflow-step',
    {
      workflowExecutionId,
      stepIndex: resolvedNextIndex,
      userId: resolvedUserId,
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
    },
    WORKFLOW_JOB_DEFAULTS,
  );
}

/**
 * Pause a workflow (transition to blocked).
 */
export async function pauseWorkflow(workflowId: string, candidateId: string): Promise<void> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowId },
    select: { status: true, candidateId: true, metadata: true },
  });

  if (!execution) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (execution.candidateId !== candidateId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const next = getNextWorkflowStatus(execution.status as any, 'pause');
  if (!next) {
    throw Object.assign(
      new Error(`Cannot pause workflow in status: ${execution.status}`),
      { status: 400 },
    );
  }

  // Merge pausedAt into existing metadata rather than overwriting the whole field.
  const existingMeta = (execution.metadata && typeof execution.metadata === 'object')
    ? (execution.metadata as Record<string, unknown>)
    : {};
  const mergedMeta = { ...existingMeta, pausedAt: new Date().toISOString() };

  await prisma.workflowExecution.update({
    where: { id: workflowId },
    data: { status: next, metadata: mergedMeta as any },
  });
}

/**
 * Resume a paused workflow (transition from blocked to running).
 */
export async function resumeWorkflow(workflowId: string, candidateId: string): Promise<void> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowId },
    select: { status: true, candidateId: true, currentStepIndex: true, context: true },
  });

  if (!execution) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (execution.candidateId !== candidateId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const next = getNextWorkflowStatus(execution.status as any, 'resume');
  if (!next) {
    throw Object.assign(
      new Error(`Cannot resume workflow in status: ${execution.status}`),
      { status: 400 },
    );
  }

  const userId = (execution.context as any)?.userId as string | undefined;
  if (!userId) {
    throw Object.assign(new Error('Cannot resume: userId missing from workflow context'), { status: 500 });
  }

  // Verify the current step is not already running/queued to avoid duplicate concurrent processing.
  const currentStep = await prisma.workflowStepExecution.findFirst({
    where: { workflowId, stepIndex: execution.currentStepIndex },
    select: { status: true },
  });
  if (currentStep?.status === 'running' || currentStep?.status === 'queued') {
    throw Object.assign(new Error('Cannot resume: current step is already running or queued'), { status: 409 });
  }

  await prisma.workflowExecution.update({
    where: { id: workflowId },
    data: { status: next },
  });

  // Re-enqueue current step
  await getWorkflowQueue().add(
    'workflow-step',
    {
      workflowExecutionId: workflowId,
      stepIndex: execution.currentStepIndex,
      userId,
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
    },
    WORKFLOW_JOB_DEFAULTS,
  );
}

/**
 * Cancel a workflow.
 */
export async function cancelWorkflow(workflowId: string, candidateId: string, reason?: string): Promise<void> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowId },
    select: { status: true, candidateId: true },
  });

  if (!execution) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (execution.candidateId !== candidateId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  // 'completed' and 'cancelled' are truly irrecoverable — skip silently.
  // 'failed' retains a valid 'cancel' transition in the state machine so we allow it through.
  if (execution.status === 'completed' || execution.status === 'cancelled') {
    return; // Already in an irrecoverable terminal state — no-op
  }

  await prisma.workflowExecution.update({
    where: { id: workflowId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
      errorMessage: reason ?? 'Cancelled by user',
    },
  });

  await publishWorkflowEvent(candidateId, {
    type: 'workflow:cancelled',
    workflowId,
    reason,
    timestamp: new Date(),
  });
}

/**
 * Handle an approval decision. If approved, resume the workflow from the approval step.
 */
export async function handleApprovalDecision(
  approvalId: string,
  candidateId: string,
  decision: ApprovalDecision,
  note?: string,
  modifiedPayload?: ApprovalPayload,
): Promise<void> {
  const approval = await prisma.approvalRequest.findUnique({
    where: { id: approvalId },
    select: { workflowId: true, stepKey: true },
  });

  if (!approval) throw Object.assign(new Error('Approval not found'), { status: 404 });

  // Record the decision
  await recordApprovalDecision(approvalId, candidateId, decision, note, modifiedPayload);

  const execution = await prisma.workflowExecution.findUnique({
    where: { id: approval.workflowId },
    select: { status: true, currentStepIndex: true, context: true, candidateId: true },
  });

  if (!execution) return;

  if (decision === 'approved' || decision === 'modified') {
    // Find the approval step and mark it completed
    const stepExec = await prisma.workflowStepExecution.findFirst({
      where: { workflowId: approval.workflowId, stepKey: approval.stepKey },
    });

    if (stepExec) {
      await prisma.workflowStepExecution.update({
        where: { id: stepExec.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          output: { approvalId, decision, note } as any,
        },
      });
    }

    // Transition workflow back to running
    await prisma.workflowExecution.update({
      where: { id: approval.workflowId },
      data: { status: 'running' },
    });

    const userId = (execution.context as any)?.userId as string;

    // Advance to next step
    await advanceToNextStep(
      approval.workflowId,
      execution.currentStepIndex,
      execution.candidateId,
      execution.currentStepIndex + 1,
      userId,
    );
  } else {
    // Rejected — fail the workflow
    await prisma.workflowExecution.update({
      where: { id: approval.workflowId },
      data: {
        status: 'failed',
        failedAt: new Date(),
        errorMessage: `Approval rejected: ${note ?? 'No reason provided'}`,
      },
    });

    await publishWorkflowEvent(execution.candidateId, {
      type: 'workflow:failed',
      workflowId: approval.workflowId,
      reason: 'approval_rejected',
      timestamp: new Date(),
    });
  }
}

/**
 * Recover a failed workflow by re-queuing it from the current step.
 * This is the only sanctioned way to leave the 'failed' state (the 'recover' transition).
 */
export async function recoverWorkflow(workflowId: string, candidateId: string): Promise<void> {
  const execution = await prisma.workflowExecution.findUnique({
    where: { id: workflowId },
    select: { status: true, candidateId: true, currentStepIndex: true, context: true },
  });

  if (!execution) throw Object.assign(new Error('Workflow not found'), { status: 404 });
  if (execution.candidateId !== candidateId) throw Object.assign(new Error('Forbidden'), { status: 403 });

  if (execution.status !== 'failed') {
    throw Object.assign(
      new Error(`Cannot recover workflow in status: ${execution.status} — only 'failed' workflows can be recovered`),
      { status: 400 },
    );
  }

  const userId = (execution.context as any)?.userId as string | undefined;
  if (!userId) {
    throw Object.assign(new Error('Cannot recover: userId missing from workflow context'), { status: 500 });
  }

  // Transition failed → queued (the 'recover' event in the state machine)
  await prisma.workflowExecution.update({
    where: { id: workflowId },
    data: { status: 'queued', errorMessage: null, failedAt: null },
  });

  // Reset the current step from 'failed' to 'pending' so advanceWorkflow will retry it
  // rather than treating it as already terminal.
  await prisma.workflowStepExecution.updateMany({
    where: { workflowId, stepIndex: execution.currentStepIndex, status: 'failed' },
    data: { status: 'pending', errorMessage: null },
  });

  await getWorkflowQueue().add(
    'workflow-step',
    {
      workflowExecutionId: workflowId,
      stepIndex: execution.currentStepIndex,
      userId,
      schemaVersion: WORKFLOW_SCHEMA_VERSION,
    },
    WORKFLOW_JOB_DEFAULTS,
  );

  await publishWorkflowEvent(candidateId, {
    type: 'workflow:recovered',
    workflowId,
    timestamp: new Date(),
  });
}
