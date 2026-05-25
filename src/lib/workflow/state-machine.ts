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

export function isTerminalWorkflowStatus(status: WorkflowStatus): boolean {
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
