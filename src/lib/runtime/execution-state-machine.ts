import { AgentExecutionStatus } from '@prisma/client';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';

const stateMachineLogger = createLogger({ component: 'execution-state-machine' });

/**
 * Valid transitions lookup map (single source of truth)
 */
const LEGAL_TRANSITIONS: Record<AgentExecutionStatus, AgentExecutionStatus[]> = {
  queued: ['running', 'failed', 'interrupted'],
  running: ['completed', 'failed', 'paused', 'interrupted'],
  paused: ['running', 'failed', 'interrupted'],
  completed: ['queued'], // Allowed for manual replay/reset
  failed: ['queued', 'running'],    // Allowed for manual replay or retry loops
  interrupted: ['queued', 'running', 'failed'], // Re-queueing after crash/restart
};

export class InvalidStateTransitionError extends Error {
  constructor(
    public readonly executionId: string,
    public readonly oldState: AgentExecutionStatus,
    public readonly newState: AgentExecutionStatus
  ) {
    super(`Invalid execution state transition from '${oldState}' to '${newState}' for execution ${executionId}`);
    this.name = 'InvalidStateTransitionError';
  }
}

export interface TransitionAuditPayload {
  executionId: string;
  oldState: AgentExecutionStatus;
  newState: AgentExecutionStatus;
  correlationId?: string;
  requestId?: string;
  userId?: string;
  actor?: string;
  justification?: string;
}

/**
 * Validates whether a transition is allowed under the deterministic state machine.
 */
export function isValidTransition(oldState: AgentExecutionStatus, newState: AgentExecutionStatus): boolean {
  const allowed = LEGAL_TRANSITIONS[oldState];
  return allowed ? allowed.includes(newState) : false;
}

/**
 * Performs a validated state transition on an execution, updating the DB and writing a structured audit log.
 */
export async function transitionExecutionState(
  executionId: string,
  newState: AgentExecutionStatus,
  options: {
    actor?: string;
    justification?: string;
    correlationId?: string;
    requestId?: string;
    userId?: string;
  } = {}
): Promise<void> {
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    select: {
      status: true,
      correlationId: true,
      requestId: true,
      userId: true,
    },
  });

  if (!execution) {
    throw new Error(`Execution record with ID ${executionId} not found`);
  }

  const oldState = execution.status;

  // If already in target state, treat as idempotent no-op
  if (oldState === newState) {
    return;
  }

  if (!isValidTransition(oldState, newState)) {
    stateMachineLogger.error(
      {
        executionId,
        oldState,
        newState,
        correlationId: options.correlationId || execution.correlationId || undefined,
      },
      'REJECTED invalid execution state transition'
    );
    throw new InvalidStateTransitionError(executionId, oldState, newState);
  }

  // Atomically update DB to avoid race conditions
  await prisma.$transaction(async (tx) => {
    // Confirm status matches oldState at transaction start
    const current = await tx.agentExecution.findUnique({
      where: { id: executionId },
      select: { status: true },
    });

    if (!current || current.status !== oldState) {
      throw new Error(`Execution state modified concurrently during transition from ${oldState} to ${newState}`);
    }

    // Apply the transition
    await tx.agentExecution.update({
      where: { id: executionId },
      data: {
        status: newState,
        // Automatically set startedAt/completedAt based on target state
        startedAt: newState === 'running' ? new Date() : undefined,
        completedAt: ['completed', 'failed', 'interrupted'].includes(newState) ? new Date() : undefined,
      },
    });

    // Write structured transition audit as an EventLog record
    await tx.eventLog.create({
      data: {
        executionId,
        level: 'INFO',
        message: `State transition: ${oldState} -> ${newState}`,
        metadata: {
          event: 'state_transition_audit',
          oldState,
          newState,
          actor: options.actor || 'system',
          justification: options.justification || 'standard flow',
          correlationId: options.correlationId || execution.correlationId || null,
          requestId: options.requestId || execution.requestId || null,
          timestamp: new Date().toISOString(),
        },
      },
    });
  });

  stateMachineLogger.info(
    {
      executionId,
      oldState,
      newState,
      actor: options.actor || 'system',
      correlationId: options.correlationId || execution.correlationId || undefined,
    },
    'Execution state transition audit logged successfully'
  );
}
