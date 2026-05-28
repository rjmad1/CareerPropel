/**
 * @jest-environment node
 *
 * State Machine & Ledger Invariant Tests
 */

import { prisma } from '@/lib/db';
import { transitionExecutionState, InvalidStateTransitionError } from '@/lib/runtime/execution-state-machine';
import { assessReplayEligibility } from '@/lib/observability/replay';

describe('State Machine & Ledger Invariants', () => {
  let testExecutionId: string;

  beforeEach(async () => {
    const execution = await prisma.agentExecution.create({
      data: {
        userId: 'test-user-invariants',
        agentType: 'resume-tailor',
        status: 'queued',
        input: JSON.stringify({ jobId: 'job-123' }),
      } as any,
    });
    testExecutionId = execution.id;
  });

  afterEach(async () => {
    await prisma.agentExecution.deleteMany({
      where: { userId: 'test-user-invariants' },
    });
    await prisma.eventLog.deleteMany({
      where: { executionId: testExecutionId },
    });
    await prisma.executionEventLedger.deleteMany({
      where: { executionId: testExecutionId },
    });
  });

  it('completed executions cannot transition to invalid states directly', async () => {
    // Transition to running
    await transitionExecutionState(testExecutionId, 'running');
    // Transition to completed
    await transitionExecutionState(testExecutionId, 'completed');

    // Attempting to go directly from completed -> running must be rejected
    await expect(
      transitionExecutionState(testExecutionId, 'running')
    ).rejects.toThrow(InvalidStateTransitionError);

    // Attempting to go directly from completed -> failed must be rejected
    await expect(
      transitionExecutionState(testExecutionId, 'failed')
    ).rejects.toThrow(InvalidStateTransitionError);
  });

  it('enforces eventId uniqueness in the execution event ledger', async () => {
    const eventId = `test-unique-event-${Date.now()}`;

    // First insert succeeds
    await prisma.executionEventLedger.create({
      data: {
        eventId,
        executionId: testExecutionId,
        eventType: 'execution:worker_pickup',
        payload: {},
        sourceRuntime: 'test',
      },
    });

    // Second insert with the same eventId must fail
    await expect(
      prisma.executionEventLedger.create({
        data: {
          eventId,
          executionId: testExecutionId,
          eventType: 'execution:completed',
          payload: {},
          sourceRuntime: 'test',
        },
      })
    ).rejects.toThrow();
  });

  it('detects ledger sequence violations during replay eligibility checks', async () => {
    // 1. Log completed event BEFORE worker_pickup event (out of sequence order)
    await prisma.executionEventLedger.create({
      data: {
        eventId: `ev-term-${Date.now()}`,
        executionId: testExecutionId,
        eventType: 'execution:completed',
        payload: {},
        sourceRuntime: 'test',
        timestamp: new Date(Date.now() - 5000), // 5 seconds ago
      },
    });

    await prisma.executionEventLedger.create({
      data: {
        eventId: `ev-pickup-${Date.now()}`,
        executionId: testExecutionId,
        eventType: 'execution:worker_pickup',
        payload: {},
        sourceRuntime: 'test',
        timestamp: new Date(), // Now (after completed event)
      },
    });

    // Set execution status to failed/completed to run replay check
    await prisma.agentExecution.update({
      where: { id: testExecutionId },
      data: {
        status: 'completed',
        agentType: 'follow-up',
      },
    });

    const assessment = await assessReplayEligibility(testExecutionId);
    expect(assessment.eligibility).toBe('conditional');
    expect(assessment.reasons).toContain('Ledger sequence violation: terminal event preceding worker pickup');
  });
});
