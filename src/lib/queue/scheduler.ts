import { createLogger } from '@/lib/logging/logger';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import { prisma } from '@/lib/db';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { CANONICAL_WORKERS } from '@/lib/queue/health';

const schedulerLogger = createLogger({ component: 'scheduler' });
const schedulerConnection = createRedisClient('career-propel:scheduler');

type SchedulerRuntime = {
  close(): Promise<void>;
  waitUntilReady(): Promise<void>;
};

let scheduler: SchedulerRuntime | null = null;
let cleanupTimer: NodeJS.Timeout | null = null;
let reconciliationTimer: NodeJS.Timeout | null = null;

// Reconciles database executions that are stuck/queued/running with actual BullMQ state
export async function reconcileOrphanExecutions() {
  schedulerLogger.info('Starting orphan execution reconciliation sweep...');
  try {
    const queue = getExecutionQueue();

    // 1. Fetch running or queued executions that might be stuck
    const activeDbExecutions = await prisma.agentExecution.findMany({
      where: {
        status: { in: ['running', 'queued'] },
      },
      select: {
        id: true,
        status: true,
        queueJobId: true,
        userId: true,
        agentType: true,
        createdAt: true,
        correlationId: true,
        requestId: true,
      },
    });

    if (activeDbExecutions.length === 0) {
      schedulerLogger.debug('No active or queued executions found in DB.');
      return;
    }

    schedulerLogger.info({ activeCount: activeDbExecutions.length }, `Auditing active/queued executions`);

    for (const exec of activeDbExecutions) {
      // Handle executions stuck in 'queued' without a jobId for more than 5 minutes
      if (!exec.queueJobId) {
        const ageMs = Date.now() - exec.createdAt.getTime();
        if (ageMs > 5 * 60 * 1000) {
          schedulerLogger.warn(
            { executionId: exec.id, status: exec.status, ageMinutes: Math.round(ageMs / 60000) },
            'Execution enqueuing stalled (no queueJobId after 5m). Reconciling to failed.'
          );
          
          await failOrphanExecution(
            exec.id,
            exec.userId,
            exec.agentType,
            'Execution stalled: failed to enqueue or scheduler crashed before processing.',
            exec.correlationId,
            exec.requestId
          );
        }
        continue;
      }

      // 2. Fetch the corresponding job from BullMQ
      const job = await queue.getJob(exec.queueJobId);

      // If job is null, it means the job was removed, deleted, or expired from BullMQ
      if (!job) {
        schedulerLogger.warn(
          { executionId: exec.id, queueJobId: exec.queueJobId },
          'Execution is active/queued in DB but corresponding BullMQ job is missing. Reconciling to failed.'
        );
        await failOrphanExecution(
          exec.id,
          exec.userId,
          exec.agentType,
          'Execution orphaned: worker crashed or BullMQ job was purged from Redis.',
          exec.correlationId,
          exec.requestId,
          exec.queueJobId
        );
        continue;
      }

      // Check job status in BullMQ
      const state = await job.getState();

      // If job completed or failed in BullMQ, but DB got stuck in queued/running, reconcile it
      if (state === 'completed') {
        schedulerLogger.warn(
          { executionId: exec.id, queueJobId: exec.queueJobId, state },
          'Execution stuck in DB as running/queued but BullMQ job is completed. Reconciling to completed.'
        );
        const outputData = job.returnvalue ? JSON.stringify(job.returnvalue) : null;
        await prisma.agentExecution.update({
          where: { id: exec.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            output: outputData,
          },
        });
        await publishRealtimeEvent(exec.userId, {
          type: 'execution:completed',
          executionId: exec.id,
          userId: exec.userId,
          agentType: exec.agentType,
          status: 'completed',
          currentTask: 'Completed (reconciled by scheduler)',
          correlationId: exec.correlationId,
          requestId: exec.requestId,
          queueJobId: exec.queueJobId,
          timestamp: new Date().toISOString(),
        });
      } else if (state === 'failed') {
        schedulerLogger.warn(
          { executionId: exec.id, queueJobId: exec.queueJobId, state },
          'Execution stuck in DB as running/queued but BullMQ job is failed. Reconciling to failed.'
        );
        await failOrphanExecution(
          exec.id,
          exec.userId,
          exec.agentType,
          job.failedReason || 'BullMQ execution job failed in background.',
          exec.correlationId,
          exec.requestId,
          exec.queueJobId
        );
      }
    }
  } catch (error) {
    schedulerLogger.error({ err: error }, 'Error occurred during orphan execution reconciliation sweep');
  }
}

async function auditQueueAndWorkerHealth() {
  try {
    const queue = getExecutionQueue();
    const dlq = getDeadLetterQueue();

    const [counts, dlqCounts] = await Promise.all([
      queue.getJobCounts('waiting', 'active', 'failed'),
      dlq.getJobCounts('waiting', 'active', 'failed'),
    ]);

    const dlqTotal = (dlqCounts.waiting || 0) + (dlqCounts.active || 0) + (dlqCounts.failed || 0);
    if (dlqTotal > runtimeSettings.dlqWarningThreshold) {
      schedulerLogger.warn(
        { dlqCount: dlqTotal, threshold: runtimeSettings.dlqWarningThreshold },
        'DLQ depth growth detected! DLQ contains failed jobs requiring manual recovery.'
      );
    }

    const backlog = counts.waiting || 0;
    if (backlog > runtimeSettings.queueBacklogWarningThreshold) {
      schedulerLogger.warn(
        { backlogCount: backlog, threshold: runtimeSettings.queueBacklogWarningThreshold },
        'Queue backlog growth detected! High latency expected for new executions.'
      );
    }

    const activeJobs = await queue.getJobs(['active']);
    for (const job of activeJobs) {
      if (job.attemptsMade > 2) {
        schedulerLogger.warn(
          {
            jobId: job.id,
            attemptsMade: job.attemptsMade,
            executionId: job.data?.executionId,
            correlationId: job.data?.correlationId,
          },
          'Repeated job execution retry spike detected!'
        );
      }
    }

    const now = Date.now();
    for (const workerName of CANONICAL_WORKERS) {
      if (workerName === 'scheduler-process') continue;

      const key = `heartbeat:${workerName}`;
      const v = await schedulerConnection.get(key);

      if (!v) {
        schedulerLogger.warn(
          { workerName },
          'Worker heartbeat missing! Worker has not registered a heartbeat key in Redis.'
        );
        continue;
      }

      try {
        const { ts } = JSON.parse(v) as { ts: number };
        const elapsed = now - ts;

        if (elapsed > runtimeSettings.heartbeatCriticalMs) {
          schedulerLogger.error(
            { workerName, lastHeartbeatAgoMs: elapsed },
            'Worker runtime STALLED (CRITICAL)! Heartbeat elapsed limit exceeded.'
          );
        } else if (elapsed > runtimeSettings.heartbeatStaleMs) {
          schedulerLogger.warn(
            { workerName, lastHeartbeatAgoMs: elapsed },
            'Worker heartbeat STALE! Worker may be under high CPU load or experiencing network latency.'
          );
        }
      } catch (err) {
        schedulerLogger.error(
          { workerName, rawValue: v, err },
          'Failed to parse worker heartbeat value'
        );
      }
    }
  } catch (error) {
    schedulerLogger.error({ err: error }, 'Error occurred during queue and worker health audit');
  }
}

async function failOrphanExecution(
  executionId: string,
  userId: string,
  agentType: string,
  reason: string,
  correlationId: string | null,
  requestId: string | null,
  queueJobId?: string | null
) {
  await prisma.agentExecution.update({
    where: { id: executionId },
    data: {
      status: 'failed',
      completedAt: new Date(),
      errorMessage: reason,
    },
  });

  await publishRealtimeEvent(userId, {
    type: 'execution:failed',
    executionId,
    userId,
    agentType,
    status: 'failed',
    currentTask: reason,
    correlationId: correlationId || undefined,
    requestId: requestId || undefined,
    queueJobId: queueJobId || undefined,
    timestamp: new Date().toISOString(),
  });
}

export async function startQueueScheduler() {
  if (!scheduler) {
    scheduler = {
      async waitUntilReady() {
        await schedulerConnection.ping();
      },
      async close() {},
    };
  }

  await scheduler.waitUntilReady();
  schedulerLogger.info(
    {
      executionQueueName: runtimeSettings.executionQueueName,
      workerHeartbeatSeconds: runtimeSettings.workerHeartbeatSeconds,
    },
    'Scheduler runtime ready'
  );

  // Completed/failed jobs clean-up loop
  if (!cleanupTimer) {
    cleanupTimer = setInterval(async () => {
      const queue = getExecutionQueue();
      await queue.clean(24 * 60 * 60 * 1000, 1000, 'completed');
      await queue.clean(7 * 24 * 60 * 60 * 1000, 1000, 'failed');
    }, runtimeSettings.schedulerCleanupIntervalMs);
  }

  // Periodic stuck/orphaned execution recovery & health audit loop (run every 1 minute)
  if (!reconciliationTimer) {
    reconciliationTimer = setInterval(async () => {
      await reconcileOrphanExecutions();
      await auditQueueAndWorkerHealth();
    }, 60 * 1000);
  }

  // Run initial reconciliation and health audit on boot
  void reconcileOrphanExecutions().catch((err) => {
    schedulerLogger.error({ err }, 'Initial post-boot reconciliation failed');
  });
  void auditQueueAndWorkerHealth().catch((err) => {
    schedulerLogger.error({ err }, 'Initial post-boot health audit failed');
  });

  return scheduler;
}

export async function closeQueueScheduler() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  if (reconciliationTimer) {
    clearInterval(reconciliationTimer);
    reconciliationTimer = null;
  }

  await Promise.all([scheduler?.close(), disconnectRedisClient(schedulerConnection)]);
  scheduler = null;
}
