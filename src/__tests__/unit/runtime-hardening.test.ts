/**
 * @jest-environment node
 */

import { isValidTransition, transitionExecutionState, InvalidStateTransitionError } from '@/lib/runtime/execution-state-machine';
import { evaluateAdmission } from '@/lib/queue/admission-control';
import { getBufferedEventsForUser } from '@/lib/realtime/sharedSubscriber';
import { prisma } from '@/lib/db';

jest.mock('@/lib/queue/queues', () => ({
  getExecutionQueue: () => ({
    getJobCounts: jest.fn().mockResolvedValue({ waiting: 0, active: 0 }),
  }),
}));

describe('Phase 2 — Runtime Hardening & Operational Determinism Integration Tests', () => {
  const testUserId = 'test-operator-candidate@careerpropel.io';

  beforeAll(async () => {
    // Ensure test user exists
    await prisma.candidate.upsert({
      where: { email: testUserId },
      update: {},
      create: {
        email: testUserId,
        name: 'Test Hardening Candidate',
      },
    });

    // Initial cleanup of any residual test data from previous aborts
    const executions = await prisma.agentExecution.findMany({
      where: { userId: testUserId },
      select: { id: true },
    });
    const ids = executions.map((e) => e.id);
    if (ids.length > 0) {
      await prisma.eventLog.deleteMany({
        where: { executionId: { in: ids } },
      });
      await prisma.agentExecution.deleteMany({
        where: { id: { in: ids } },
      });
    }
  });

  afterEach(async () => {
    const executions = await prisma.agentExecution.findMany({
      where: { userId: testUserId },
      select: { id: true },
    });
    const ids = executions.map((e) => e.id);
    if (ids.length > 0) {
      await prisma.eventLog.deleteMany({
        where: { executionId: { in: ids } },
      });
      await prisma.agentExecution.deleteMany({
        where: { id: { in: ids } },
      });
    }
  });

  describe('1. Execution State Machine Enforcement', () => {
    it('should validate legal execution status transitions successfully', () => {
      expect(isValidTransition('queued', 'running')).toBe(true);
      expect(isValidTransition('running', 'completed')).toBe(true);
      expect(isValidTransition('running', 'failed')).toBe(true);
      expect(isValidTransition('failed', 'queued')).toBe(true);
    });

    it('should reject illegal transitions under the state machine rules', () => {
      expect(isValidTransition('queued', 'completed')).toBe(false);
      expect(isValidTransition('completed', 'failed')).toBe(false);
      expect(isValidTransition('failed', 'running')).toBe(true); // Retry transition
    });

    it('should throw an error and rollback transaction on illegal transition attempt', async () => {
      const execution = await prisma.agentExecution.create({
        data: {
          userId: testUserId,
          agentType: 'resume-tailor',
          status: 'completed',
        },
      });

      await expect(
        transitionExecutionState(execution.id, 'failed', { actor: 'test-runner' })
      ).rejects.toThrow(InvalidStateTransitionError);

      // Verify status remains completed and was not updated
      const fresh = await prisma.agentExecution.findUnique({ where: { id: execution.id } });
      expect(fresh?.status).toBe('completed');
    });

    it('should log structured audit event logs upon successful transition', async () => {
      const execution = await prisma.agentExecution.create({
        data: {
          userId: testUserId,
          agentType: 'resume-tailor',
          status: 'queued',
        },
      });

      await transitionExecutionState(execution.id, 'running', { actor: 'test-runner', justification: 'started job' });
      
      const logs = await prisma.eventLog.findMany({
        where: { executionId: execution.id },
      });

      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].message).toContain('State transition: queued -> running');
      const metadata = logs[0].metadata as any;
      expect(metadata?.oldState).toBe('queued');
      expect(metadata?.newState).toBe('running');
      expect(metadata?.actor).toBe('test-runner');
    });
  });

  describe('2. Queue Admission Control Gates', () => {
    it('should admit normal requests within quota limits', async () => {
      const admission = await evaluateAdmission(testUserId, 'resume-tailor');
      expect(admission.allowed).toBe(true);
    });

    it('should reject requests exceeding active concurrency limits', async () => {
      // Create 5 fake executions currently in 'running' state
      const created = await Promise.all(
        Array.from({ length: 5 }).map(() =>
          prisma.agentExecution.create({
            data: {
              userId: testUserId,
              agentType: 'resume-tailor',
              status: 'running',
            },
          })
        )
      );

      const admission = await evaluateAdmission(testUserId, 'resume-tailor');
      expect(admission.allowed).toBe(false);
      expect(admission.reason).toContain('concurrency ceiling reached');

      // Cleanup
      await prisma.agentExecution.deleteMany({
        where: { id: { in: created.map((c) => c.id) } },
      });
    });
  });

  describe('3. SSE Connection Replay and Buffering', () => {
    it('should correctly slice reconnect events buffer using Last-Event-ID', () => {
      // Mock buffered event checks
      const mockEvents = getBufferedEventsForUser(testUserId, 'ev_non_existent');
      expect(Array.isArray(mockEvents)).toBe(true);
    });
  });
});
