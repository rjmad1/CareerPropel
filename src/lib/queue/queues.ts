import { Queue } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { createDeadLetterQueue, DeadLetterPayload } from '@/lib/queue/dead-letter';
import { createQueueJobOptions } from '@/lib/queue/retry-policy';
import { executionJobDataSchema } from '@/contracts/queue/jobs';

const queueLogger = createLogger({ component: 'queue' });
const connection = createRedisClient('career-propel:queue');

export interface ExecutionJobData {
  executionId: string;
  userId: string;
  agentType: string;
  promptContext: Record<string, string | undefined>;
  requestId: string;
  correlationId: string;
  submittedAt: string;
  jobId?: string;
  payloadVersion?: string;
}

export const PARTITIONED_QUEUES = {
  'high-priority': 'agent-execution-high-priority',
  'standard': 'agent-execution-standard',
  'heavy': 'agent-execution-heavy',
  'maintenance': 'agent-execution-maintenance',
  'dlq': 'agent-execution-dlq',
} as const;

export type QueuePartition = keyof typeof PARTITIONED_QUEUES;

import { routeQueuePartition } from '@/lib/runtime/isolation';

export const partitionedQueues: Record<Exclude<QueuePartition, 'dlq'>, Queue<ExecutionJobData>> & { dlq: Queue<DeadLetterPayload> } = {
  'high-priority': new Queue<ExecutionJobData>(PARTITIONED_QUEUES['high-priority'], {
    connection,
    defaultJobOptions: createQueueJobOptions(),
  }),
  'standard': new Queue<ExecutionJobData>(PARTITIONED_QUEUES['standard'], {
    connection,
    defaultJobOptions: createQueueJobOptions(),
  }),
  'heavy': new Queue<ExecutionJobData>(PARTITIONED_QUEUES['heavy'], {
    connection,
    defaultJobOptions: createQueueJobOptions(),
  }),
  'maintenance': new Queue<ExecutionJobData>(PARTITIONED_QUEUES['maintenance'], {
    connection,
    defaultJobOptions: createQueueJobOptions(),
  }),
  'dlq': createDeadLetterQueue(connection),
};

const executionQueue = partitionedQueues['standard'];
const deadLetterQueue = partitionedQueues['dlq'];

export function getExecutionQueue() {
  return executionQueue;
}

export function getDeadLetterQueue() {
  return deadLetterQueue;
}

export function getPartitionedQueue(partition: QueuePartition): Queue<any> {
  return partitionedQueues[partition];
}

export async function enqueueExecution(data: ExecutionJobData, partition?: QueuePartition) {
  // Enforce contract validation at the boundary
  const validatedData = executionJobDataSchema.parse(data);

  // Determine partition dynamically using isolation policies if not forced
  const targetPartition = (partition || routeQueuePartition(validatedData.agentType, {
    retryCount: 0, // Initial enqueue
  })) as Exclude<QueuePartition, 'dlq'>;

  const targetQueue = partitionedQueues[targetPartition] as Queue<ExecutionJobData>;

  queueLogger.info(
    {
      executionId: validatedData.executionId,
      userId: validatedData.userId,
      agentType: validatedData.agentType,
      correlationId: validatedData.correlationId,
      partition: targetPartition,
    },
    `Enqueueing execution to partition: ${targetPartition}`
  );

  // Normalise promptContext: convert null → undefined (schema allows null, but ExecutionJobData requires string | undefined)
  const promptContext: Record<string, string | undefined> = Object.fromEntries(
    Object.entries(validatedData.promptContext).map(([k, v]) => [k, v ?? undefined])
  );

  return targetQueue.add('execute-agent', {
    ...validatedData,
    promptContext,
    // jobId: convert null → undefined to satisfy ExecutionJobData type (BullMQ doesn't distinguish them)
    jobId: validatedData.jobId ?? undefined,
  }, {
    ...createQueueJobOptions({
      jobId: validatedData.executionId,
    }),
  });
}

export async function enqueueDeadLetter(payload: DeadLetterPayload) {
  return deadLetterQueue.add(`dead-letter-${payload.executionId}`, payload, {
    ...createQueueJobOptions({
      jobId: `${payload.executionId}-${payload.attemptsMade}`,
    }),
  });
}

export async function getQueueMetrics() {
  const summaries = await Promise.all(
    Object.entries(partitionedQueues).map(async ([name, q]) => {
      const counts = await q.getJobCounts('active', 'completed', 'delayed', 'failed', 'waiting');
      const jobs = await q.getJobs(['active', 'waiting', 'delayed'], 0, 50, true);
      const now = Date.now();
      const latencies = jobs
        .map((j) => {
          const subAt = Date.parse((j.data as any).submittedAt);
          return Number.isNaN(subAt) ? 0 : now - subAt;
        })
        .filter((val) => val > 0);
      
      const avgLatencyMs = latencies.length > 0
        ? Math.round(latencies.reduce((sum, val) => sum + val, 0) / latencies.length)
        : 0;

      return { name, counts, avgLatencyMs };
    })
  );

  const standard = summaries.find((s) => s.name === 'standard') || { counts: {}, avgLatencyMs: 0 };
  return {
    counts: standard.counts,
    averageLatencyMs: standard.avgLatencyMs,
    partitions: summaries,
  };
}

export async function closeQueues() {
  await Promise.all([
    ...Object.values(partitionedQueues).map((q) => q.close()),
    connection.quit(),
  ]);
}

