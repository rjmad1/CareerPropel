/**
 * @jest-environment node
 *
 * Queue Topology Partitioning, Routing & DLQ Integrity Tests
 */

import { routeQueuePartition, getAgentIsolationPolicy } from '@/lib/runtime/isolation';
import { enqueueDeadLetter, partitionedQueues } from '@/lib/queue/queues';

describe('Queue Topology & Routing Integrity', () => {
  it('correctly maps agent types to partitioned queues based on isolation policies', () => {
    // 1. Check default queue assignment
    expect(routeQueuePartition('resume-tailor')).toBe('high-priority');
    expect(routeQueuePartition('research')).toBe('standard');
    expect(routeQueuePartition('system-maintenance')).toBe('maintenance');

    // 2. Check cost-based upgrade/downgrade routing
    // High-cost operations (> $0.50) route to heavy queue
    expect(routeQueuePartition('resume-tailor', { estimatedCost: 0.60 })).toBe('heavy');
    expect(routeQueuePartition('research', { estimatedCost: 0.10 })).toBe('standard');

    // 3. Check duration-based routing (> 10 mins)
    expect(routeQueuePartition('research', { durationMs: 700000 })).toBe('heavy');

    // 4. Check retry-count based promotion to heavy queue
    expect(routeQueuePartition('research', { retryCount: 4 })).toBe('heavy');
  });

  it('verifies DLQ enqueue promotion successfully places tasks in dead letter storage', async () => {
    const testExecutionId = `test-dlq-${Date.now()}`;
    const payload = {
      executionId: testExecutionId,
      queueJobId: 'job-999',
      userId: 'user-dlq-test',
      agentType: 'resume-tailor',
      failedAt: new Date().toISOString(),
      reason: 'Simulator Permanent Failure',
      attemptsMade: 3,
      correlationId: 'corr-dlq-test',
      requestId: 'req-dlq-test',
    };

    const job = await enqueueDeadLetter(payload);
    expect(job).toBeDefined();
    expect(job.id).toBe(`${testExecutionId}-3`);

    const dlq = partitionedQueues['dlq'];
    const fetchedJob = await dlq.getJob(job.id!);
    expect(fetchedJob).toBeDefined();
    expect(fetchedJob?.data.executionId).toBe(testExecutionId);
    expect(fetchedJob?.data.reason).toBe('Simulator Permanent Failure');

    // Clean up from redis
    await job.remove();
  });
});
