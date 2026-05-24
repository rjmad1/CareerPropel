import { Queue } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { createDeadLetterQueue, DeadLetterPayload } from '@/lib/queue/dead-letter';
import { createQueueJobOptions } from '@/lib/queue/retry-policy';

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
}

const executionQueue = new Queue<ExecutionJobData>(runtimeSettings.executionQueueName, {
  connection,
  defaultJobOptions: createQueueJobOptions(),
});

const deadLetterQueue = createDeadLetterQueue(connection);

export function getExecutionQueue() {
  return executionQueue;
}

export function getDeadLetterQueue() {
  return deadLetterQueue;
}

export async function enqueueExecution(data: ExecutionJobData) {
  queueLogger.info(
    {
      executionId: data.executionId,
      userId: data.userId,
      agentType: data.agentType,
      correlationId: data.correlationId,
    },
    'Enqueueing execution'
  );

  return executionQueue.add('execute-agent', data, {
    ...createQueueJobOptions({
      jobId: data.executionId,
    }),
  });
}

export async function enqueueDeadLetter(payload: DeadLetterPayload) {
  return deadLetterQueue.add(`dead-letter:${payload.executionId}`, payload, {
    ...createQueueJobOptions({
      jobId: `${payload.executionId}:${payload.attemptsMade}`,
    }),
  });
}

export async function getQueueMetrics() {
  const [counts, job] = await Promise.all([
    executionQueue.getJobCounts('active', 'completed', 'delayed', 'failed', 'waiting'),
    executionQueue.getJobs(['active', 'waiting', 'delayed'], 0, 50, true),
  ]);

  const now = Date.now();
  const latencies = job
    .map((currentJob) => {
      const submittedAt = Date.parse(currentJob.data.submittedAt);
      return Number.isNaN(submittedAt) ? 0 : now - submittedAt;
    })
    .filter((value) => value > 0);

  return {
    counts,
    averageLatencyMs:
      latencies.length > 0
        ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
        : 0,
  };
}

export async function closeQueues() {
  await Promise.all([executionQueue.close(), deadLetterQueue.close(), connection.quit()]);
}
