import { Job, QueueEvents, Worker } from 'bullmq';
import { prisma } from '@/lib/db';
import { executeAgent } from '@/lib/agents/execution/executor';
import { createLogger } from '@/lib/logging/logger';
import { recordQueueMetric, recordWorkerExecution, recordWorkerRetry } from '@/lib/observability/metrics';
import { classifyError } from '@/lib/observability/failure-classification';
import { startTraceSpan } from '@/platform/telemetry/trace';
import { acquireExecutionSlots, releaseExecutionSlots } from '@/lib/queue/concurrency';
import { enqueueDeadLetter, PARTITIONED_QUEUES, QueuePartition } from '@/lib/queue/queues';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { getExecutionQueue, type ExecutionJobData } from '@/lib/queue/queues';
import { ConcurrencyLimitError, NonRetryableExecutionError } from '@/lib/queue/retry-policy';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { executionJobDataSchema } from '@/contracts/queue/jobs';
import { transitionExecutionState } from '@/lib/runtime/execution-state-machine';
import { logEventToLedger } from '@/lib/runtime/ledger';

const workerLogger = createLogger({ component: 'worker' });
const workerConnection = createRedisClient('career-propel:worker');
const queueEventsConnection = createRedisClient('career-propel:queue-events');

// Maintain registry of multiple active partitioned workers and event listeners
const activeWorkers = new Map<QueuePartition, Worker<ExecutionJobData>>();
const activeEvents = new Map<QueuePartition, QueueEvents>();

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
    correlationId,
    attributes: {
      executionId,
      userId,
      agentType,
      queueJobId: job.id,
      partition: job.queueName,
    },
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

    // Persist pickup into the event ledger
    await logEventToLedger({
      executionId,
      eventType: 'execution:worker_pickup',
      payload: { queueJobId: job.id, partition: job.queueName },
      correlationId,
      traceId: trace.traceId,
      spanId: trace.spanId,
      sourceRuntime: 'worker',
    });

    // Defensive check: verify AgentExecution row exists before doing anything else
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

    // Persist started status in event ledger
    await logEventToLedger({
      executionId,
      eventType: 'execution:started',
      payload: { queueJobId: job.id, status: 'running' },
      correlationId,
      traceId: trace.traceId,
      spanId: trace.spanId,
      sourceRuntime: 'worker',
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
    recordQueueMetric(job.queueName, durationMs, true);
    recordWorkerExecution('agent-worker', durationMs, true);
    trace.end({ success: true, durationMs });

    // Persist completed event in event ledger
    await logEventToLedger({
      executionId,
      eventType: 'execution:completed',
      payload: { queueJobId: job.id, status: 'completed', durationMs },
      correlationId,
      traceId: trace.traceId,
      spanId: trace.spanId,
      sourceRuntime: 'worker',
    });

  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const failure = classifyError(error, { executionId, userId, agentType, queueJobId: job.id });
    recordQueueMetric(job.queueName, durationMs, false);
    recordWorkerExecution('agent-worker', durationMs, false);
    
    trace.addEvent('execution.failed', {
      message: error instanceof Error ? error.message : String(error),
      failureType: failure.failureType,
      retryable: failure.retryable,
    });
    trace.end({ success: false, durationMs });

    // Persist failed attempt event in event ledger
    await logEventToLedger({
      executionId,
      eventType: 'execution:failed_attempt',
      payload: {
        queueJobId: job.id,
        attemptsMade: job.attemptsMade,
        error: error instanceof Error ? error.message : String(error),
        failureType: failure.failureType,
        retryable: failure.retryable,
      },
      correlationId,
      traceId: trace.traceId,
      spanId: trace.spanId,
      sourceRuntime: 'worker',
    });

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

/**
 * Handles cleanup, state transition, DLQ enqueuing, and events when a job fails.
 */
async function handleJobFailure(job: Job<ExecutionJobData>, error: Error) {
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

  // If we exceeded queue attempts or hit non-retryable error
  if (job.attemptsMade >= (job.opts.attempts || runtimeSettings.queueAttempts) || !failure.retryable) {
    try {
      const currentExecution = await prisma.agentExecution.findUnique({
        where: { id: job.data.executionId },
        select: { status: true },
      });

      if (currentExecution && currentExecution.status !== 'failed' && currentExecution.status !== 'completed') {
        await transitionExecutionState(job.data.executionId, 'failed', {
          actor: 'agent-worker',
          correlationId: job.data.correlationId,
          requestId: job.data.requestId,
          userId: job.data.userId,
          justification: error.message || 'Execution failed permanently after maximum queue attempts',
        });

        await prisma.agentExecution.update({
          where: { id: job.data.executionId },
          data: {
            errorMessage: error.message || 'Execution failed permanently after maximum queue attempts',
          },
        });
        
        workerLogger.info(
          { executionId: job.data.executionId },
          'Updated database execution status to failed for DLQ job via state machine'
        );
      }
    } catch (dbErr) {
      workerLogger.error(
        { err: dbErr, executionId: job.data.executionId },
        'Failed to update database execution status for DLQ job'
      );
    }

    // Persist final execution failure in ledger
    await logEventToLedger({
      executionId: job.data.executionId,
      eventType: 'execution:failed',
      payload: {
        queueJobId: job.id,
        reason: error.message,
        attemptsMade: job.attemptsMade,
      },
      correlationId: job.data.correlationId,
      sourceRuntime: 'worker',
    });

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

    // Persist DLQ route event in ledger
    await logEventToLedger({
      executionId: job.data.executionId,
      eventType: 'execution:dlq_route',
      payload: {
        queueJobId: job.id,
        reason: error.message,
        attemptsMade: job.attemptsMade,
      },
      correlationId: job.data.correlationId,
      sourceRuntime: 'worker',
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
}

/**
 * Creates workers for all partitions and registers callbacks.
 */
export function createExecutionWorkers(): Worker<ExecutionJobData>[] {
  if (activeWorkers.size > 0) {
    return Array.from(activeWorkers.values());
  }

  const partitionsToRun: Exclude<QueuePartition, 'dlq'>[] = [
    'high-priority',
    'standard',
    'heavy',
    'maintenance',
  ];

  for (const partition of partitionsToRun) {
    const queueName = PARTITIONED_QUEUES[partition];
    const worker = new Worker<ExecutionJobData>(
      queueName,
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

    const events = new QueueEvents(queueName, {
      connection: queueEventsConnection,
    });

    worker.on('failed', async (job, error) => {
      if (!job) return;
      await handleJobFailure(job, error);
    });

    worker.on('completed', (job) => {
      workerLogger.info(
        {
          executionId: job.data.executionId,
          queueJobId: job.id,
          attemptsMade: job.attemptsMade,
          partition,
        },
        'Execution job completed'
      );
    });

    events.on('stalled', ({ jobId }) => {
      workerLogger.warn({ jobId, partition }, 'Execution job stalled');
    });

    activeWorkers.set(partition, worker);
    activeEvents.set(partition, events);
  }

  return Array.from(activeWorkers.values());
}

/**
 * Deprecated/Compatibility helper. Returns standard worker for legacy references.
 */
export function createExecutionWorker(): Worker<ExecutionJobData> {
  createExecutionWorkers();
  return activeWorkers.get('standard')!;
}

export async function startExecutionWorker(): Promise<Worker<ExecutionJobData>> {
  createExecutionWorkers();
  await Promise.all(Array.from(activeEvents.values()).map((e) => e.waitUntilReady()));
  await Promise.all(Array.from(activeWorkers.values()).map((w) => w.run()));
  return activeWorkers.get('standard')!;
}

export async function closeExecutionWorker() {
  await Promise.all([
    ...Array.from(activeWorkers.values()).map((w) => w.close()),
    ...Array.from(activeEvents.values()).map((e) => e.close()),
    disconnectRedisClient(workerConnection),
    disconnectRedisClient(queueEventsConnection),
  ]);
  activeWorkers.clear();
  activeEvents.clear();
}

export async function getWorkerHeartbeat() {
  return {
    queue: await getExecutionQueue().getJobCounts('waiting', 'active', 'failed'),
    timestamp: new Date().toISOString(),
  };
}
