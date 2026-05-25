import type { WorkflowStatus, StepStatus } from './types';

export type WorkflowEvent =
  | 'start'
  | 'step_completed'
  | 'approval_required'
  | 'approval_approved'
  | 'approval_rejected'
  | 'step_failed'
  | 'all_steps_done'
  | 'pause'
  | 'resume'
  | 'cancel'
  | 'recover';

const WORKFLOW_TRANSITIONS: Record<WorkflowStatus, Partial<Record<WorkflowEvent, WorkflowStatus>>> = {
  queued: {
    start: 'running',
    cancel: 'cancelled',
  },
  running: {
    approval_required: 'waiting_for_approval',
    step_failed: 'failed',
    all_steps_done: 'completed',
    pause: 'blocked',
    cancel: 'cancelled',
  },
  waiting_for_approval: {
    approval_approved: 'running',
    approval_rejected: 'failed',
    cancel: 'cancelled',
  },
  blocked: {
    resume: 'running',
    cancel: 'cancelled',
  },
  failed: {
    recover: 'queued',
    cancel: 'cancelled',
  },
  completed: {},
  cancelled: {},
};

export function getNextWorkflowStatus(
  current: WorkflowStatus,
  event: WorkflowEvent,
): WorkflowStatus | null {
  return WORKFLOW_TRANSITIONS[current]?.[event] ?? null;
}

export function isValidWorkflowTransition(
  from: WorkflowStatus,
  event: WorkflowEvent,
): boolean {
  return getNextWorkflowStatus(from, event) !== null;
}

/**
 * Returns true for statuses that the automatic advance loop should never re-enter.
 * NOTE: 'failed' is intentionally excluded here so that:
 *   - cancelWorkflow can still cancel a failed workflow (valid transition in WORKFLOW_TRANSITIONS)
 *   - recoverWorkflow can re-queue a failed workflow for retry
 * Use isIrrecoverableWorkflowStatus() when you want to include failed in the check.
 */
export function isTerminalWorkflowStatus(status: WorkflowStatus): boolean {
  return status === 'completed' || status === 'cancelled';
}

/**
 * Returns true for statuses that cannot transition further under any circumstances.
 */
export function isIrrecoverableWorkflowStatus(status: WorkflowStatus): boolean {
  return status === 'completed' || status === 'cancelled' || status === 'failed';
}

// Step state machine
const STEP_TRANSITIONS: Record<StepStatus, Partial<Record<string, StepStatus>>> = {
  pending: {
    start: 'running',
    skip: 'skipped',
  },
  running: {
    complete: 'completed',
    approval_required: 'waiting_for_approval',
    fail: 'failed',
  },
  waiting_for_approval: {
    approved: 'completed',
    rejected: 'failed',
  },
  completed: {},
  failed: {},
  skipped: {},
};

export function getNextStepStatus(current: StepStatus, event: string): StepStatus | null {
  return STEP_TRANSITIONS[current]?.[event] ?? null;
}

export function isTerminalStepStatus(status: StepStatus): boolean {
  return status === 'completed' || status === 'failed' || status === 'skipped';
}
