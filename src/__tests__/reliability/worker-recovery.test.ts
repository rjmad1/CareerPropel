/**
 * @jest-environment node
 *
 * Worker Recovery and Orphan Execution Reconciliation Tests
 */

import { prisma } from '@/lib/db';
import { reconcileOrphanExecutions } from '@/lib/queue/scheduler';
import { getExecutionQueue } from '@/lib/queue/queues';

describe('Worker Recovery & Orphan Reconciliation', () => {
  let testExecutionId: string;

  beforeEach(async () => {
    // Create a mock execution stuck in 'running' state with no corresponding BullMQ job
    // to simulate a worker crashing mid-execution.
    const execution = await prisma.agentExecution.create({
      data: {
        userId: 'test-user-worker-rec',
        agentType: 'resume-tailor',
        status: 'running',
        input: JSON.stringify({ jobId: 'job-123' }),
        queueJobId: 'non-existent-job-id', // Simulate crashed/purged job
        startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      } as any,
    });
    testExecutionId = execution.id;
  });

  afterEach(async () => {
    // Clean up
    await prisma.agentExecution.deleteMany({
      where: { userId: 'test-user-worker-rec' },
    });
    await prisma.eventLog.deleteMany({
      where: { executionId: testExecutionId },
    });
    await prisma.executionEventLedger.deleteMany({
      where: { executionId: testExecutionId },
    });
  });

  it('automatically detects and fails orphaned executions missing their BullMQ jobs', async () => {
    // Verify initial status is running
    let exec = await prisma.agentExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(exec.status).toBe('running');

    // Run reconciliation sweep
    await reconcileOrphanExecutions();

    // The execution should now be failed because 'non-existent-job-id' does not exist in BullMQ
    exec = await prisma.agentExecution.findUniqueOrThrow({
      where: { id: testExecutionId },
    });
    expect(exec.status).toBe('failed');
    expect(exec.errorMessage).toContain('Execution orphaned');
  });

  it('automatically fails enqueued executions that stalled without a job ID for more than 5 minutes', async () => {
    // Create an execution stuck in 'queued' with no queueJobId
    const stalledExecution = await prisma.agentExecution.create({
      data: {
        userId: 'test-user-worker-rec',
        agentType: 'resume-tailor',
        status: 'queued',
        input: JSON.stringify({ jobId: 'job-123' }),
        queueJobId: null,
        createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
      } as any,
    });

    // Run reconciliation sweep
    await reconcileOrphanExecutions();

    const exec = await prisma.agentExecution.findUniqueOrThrow({
      where: { id: stalledExecution.id },
    });
    expect(exec.status).toBe('failed');
    expect(exec.errorMessage).toContain('Execution stalled: failed to enqueue');
  });
});
