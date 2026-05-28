import { Job, QueueEvents, Worker } from 'bullmq';
import { prisma } from '@/lib/db';
import { executeAgent } from '@/lib/agents/execution/executor';
import { createLogger } from '@/lib/logging/logger';
import { recordQueueMetric, recordWorkerExecution, recordWorkerRetry } from '@/lib/observability/metrics';
import { classifyError } from '@/lib/observability/failure-classification';
import { startTraceSpan } from '@/lib/observability/tracing';
import { acquireExecutionSlots, releaseExecutionSlots } from '@/lib/queue/concurrency';
import { enqueueDeadLetter } from '@/lib/queue/queues';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { getExecutionQueue, type ExecutionJobData } from '@/lib/queue/queues';
import { ConcurrencyLimitError, NonRetryableExecutionError } from '@/lib/queue/retry-policy';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { executionJobDataSchema } from '@/lib/validation/runtimeSchemas';

const workerLogger = createLogger({ component: 'worker' });
const workerConnection = createRedisClient('career-propel:worker');
const queueEventsConnection = createRedisClient('career-propel:queue-events');

let executionWorker: Worker<ExecutionJobData> | null = null;
let queueEvents: QueueEvents | null = null;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Execution exceeded timeout of ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeout);
        reject(error);
      });
  });
}

async function processExecution(job: Job<ExecutionJobData>) {
  const startedAt = Date.now();
  // Enforce contract validation before executing
  const validatedData = executionJobDataSchema.parse(job.data);
  const { executionId, userId, agentType, promptContext, correlationId, requestId } = validatedData;
  const trace = startTraceSpan('queue.execute-agent', {
    executionId,
    userId,
    agentType,
    queueJobId: job.id,
  });

  const acquired = await acquireExecutionSlots(userId, agentType, executionId);
  if (!acquired) {
    recordWorkerRetry('agent-worker');
    throw new ConcurrencyLimitError(`Concurrency limit reached for user ${userId}`);
  }

  try {
    workerLogger.info(
      { executionId, userId, agentType, queueJobId: job.id, correlationId, requestId },
      'Worker picked up execution'
    );

    // Defensive check: verify AgentExecution row exists before doing anything else
    // We retry up to 5 times with a 100ms delay to account for database commit/replication lag
    let executionExists = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      executionExists = await prisma.agentExecution.findUnique({
        where: { id: executionId },
        select: { id: true },
      });
      if (executionExists) {
        break;
      }
      workerLogger.warn(
        { executionId, attempt, queueJobId: job.id },
        'Worker pickup validation: AgentExecution row not found, retrying in 100ms...'
      );
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!executionExists) {
      workerLogger.warn(
        { executionId, userId, agentType, queueJobId: job.id, correlationId, requestId },
        'Worker pickup validation failed: AgentExecution row not found in database'
      );
      throw new NonRetryableExecutionError(
        `AgentExecution record with ID ${executionId} not found in database`
      );
    }

    workerLogger.info(
      { executionId, userId, agentType, queueJobId: job.id, correlationId, requestId },
      'Worker pickup validation succeeded: AgentExecution row verified'
    );

    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        queueJobId: String(job.id),
        attempts: job.attemptsMade,
        correlationId,
        requestId,
      },
    });

    await publishRealtimeEvent(userId, {
      type: 'execution:started',
      executionId,
      userId,
      agentType,
      status: 'running',
      currentTask: `Starting ${agentType}`,
      correlationId,
      requestId,
      queueJobId: String(job.id),
      timestamp: new Date().toISOString(),
    });

    const cleanPromptContext: Record<string, string | undefined> = {};
    for (const [key, val] of Object.entries(promptContext)) {
      cleanPromptContext[key] = val === null ? undefined : val;
    }

    await withTimeout(
      executeAgent({
        executionId,
        agentType: agentType as never,
        promptContext: cleanPromptContext,
        userId,
        correlationId,
        requestId,
      }),
      runtimeSettings.executionTimeoutMs
    );

    const durationMs = Date.now() - startedAt;
    recordQueueMetric(runtimeSettings.executionQueueName, durationMs, true);
    recordWorkerExecution('agent-worker', durationMs, true);
    trace.end({ success: true, durationMs });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const failure = classifyError(error, { executionId, userId, agentType, queueJobId: job.id });
    recordQueueMetric(runtimeSettings.executionQueueName, durationMs, false);
    recordWorkerExecution('agent-worker', durationMs, false);
    trace.addEvent('execution.failed', {
      message: error instanceof Error ? error.message : String(error),
      failureType: failure.failureType,
      retryable: failure.retryable,
    });
    trace.end({ success: false, durationMs });

    if (!failure.retryable) {
      throw new NonRetryableExecutionError(
        error instanceof Error ? error.message : 'Execution failed permanently'
      );
    }

    throw error;
  } finally {
    await releaseExecutionSlots(userId, agentType, executionId);
  }
}

export function createExecutionWorker() {
  if (executionWorker) {
    return executionWorker;
  }

  executionWorker = new Worker<ExecutionJobData>(
    runtimeSettings.executionQueueName,
    processExecution,
    {
      connection: workerConnection,
      concurrency: runtimeSettings.queueConcurrency,
      autorun: false,
      maxStalledCount: runtimeSettings.queueMaxStalledCount,
      lockDuration: runtimeSettings.executionTimeoutMs,
      metrics: {
        maxDataPoints: 1000,
      },
    }
  );

  queueEvents = new QueueEvents(runtimeSettings.executionQueueName, {
    connection: queueEventsConnection,
  });

  executionWorker.on('failed', async (job, error) => {
    if (!job) {
      return;
    }

    const failure = classifyError(error, {
      executionId: job.data.executionId,
      queueJobId: job.id,
      attemptsMade: job.attemptsMade,
    });

    workerLogger.error(
      {
        executionId: job.data.executionId,
        queueJobId: job.id,
        attemptsMade: job.attemptsMade,
        correlationId: job.data.correlationId,
        requestId: job.data.requestId,
        failureType: failure.failureType,
        retryable: failure.retryable,
        err: error,
      },
      'Execution job failed'
    );

    if (job.attemptsMade >= (job.opts.attempts || runtimeSettings.queueAttempts)) {
      try {
        const currentExecution = await prisma.agentExecution.findUnique({
          where: { id: job.data.executionId },
          select: { status: true },
        });

        if (currentExecution && currentExecution.status !== 'failed' && currentExecution.status !== 'completed') {
          await prisma.agentExecution.update({
            where: { id: job.data.executionId },
            data: {
              status: 'failed',
              completedAt: new Date(),
              errorMessage: error.message || 'Execution failed permanently after maximum queue attempts',
            },
          });
          workerLogger.info(
            { executionId: job.data.executionId },
            'Updated database execution status to failed for DLQ job'
          );
        }
      } catch (dbErr) {
        workerLogger.error(
          { err: dbErr, executionId: job.data.executionId },
          'Failed to update database execution status for DLQ job'
        );
      }

      await enqueueDeadLetter({
        executionId: job.data.executionId,
        queueJobId: String(job.id),
        userId: job.data.userId,
        agentType: job.data.agentType,
        failedAt: new Date().toISOString(),
        reason: error.message,
        attemptsMade: job.attemptsMade,
        correlationId: job.data.correlationId,
        requestId: job.data.requestId,
      });

      await publishRealtimeEvent(job.data.userId, {
        type: 'execution:failed',
        executionId: job.data.executionId,
        userId: job.data.userId,
        agentType: job.data.agentType,
        status: 'failed',
        currentTask: error.message,
        correlationId: job.data.correlationId,
        requestId: job.data.requestId,
        queueJobId: String(job.id),
        timestamp: new Date().toISOString(),
      });
    }
  });

  executionWorker.on('completed', (job) => {
    workerLogger.info(
      {
        executionId: job.data.executionId,
        queueJobId: job.id,
        attemptsMade: job.attemptsMade,
      },
      'Execution job completed'
    );
  });

  queueEvents.on('stalled', ({ jobId }) => {
    workerLogger.warn({ jobId }, 'Execution job stalled');
  });

  return executionWorker;
}

export async function startExecutionWorker() {
  const worker = createExecutionWorker();
  await queueEvents?.waitUntilReady();
  await worker.run();
  return worker;
}

export async function closeExecutionWorker() {
  await Promise.all([
    executionWorker?.close(),
    queueEvents?.close(),
    disconnectRedisClient(workerConnection),
    disconnectRedisClient(queueEventsConnection),
  ]);
  executionWorker = null;
  queueEvents = null;
}

export async function getWorkerHeartbeat() {
  return {
    queue: await getExecutionQueue().getJobCounts('waiting', 'active', 'failed'),
    timestamp: new Date().toISOString(),
  };
}
