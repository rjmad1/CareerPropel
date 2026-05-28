import { createLogger } from '@/lib/logging/logger';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { getExecutionQueue, getDeadLetterQueue } from '@/lib/queue/queues';
import { prisma } from '@/lib/db';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { CANONICAL_WORKERS } from '@/lib/queue/health';
import crypto from 'crypto';

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

let isLeader = false;
let leadershipInterval: NodeJS.Timeout | null = null;
const schedulerInstanceId = `sched-node-${crypto.randomUUID()}`;
const SCHEDULER_LOCK_ID = 1234567890; // Bigint for PostgreSQL advisory lock

async function acquireOrRenewLeadership() {
  try {
    if (isLeader) {
      // Just check that connection to DB is alive
      await prisma.$queryRaw`SELECT 1`;
      return;
    }

    const result = await prisma.$queryRaw<Array<{ pg_try_advisory_lock: boolean }>>`SELECT pg_try_advisory_lock(${SCHEDULER_LOCK_ID})`;
    const acquired = result?.[0]?.pg_try_advisory_lock === true;

    if (acquired) {
      promoteToLeader();
    }
  } catch (error) {
    schedulerLogger.error({ err: error }, 'Leadership election PostgreSQL advisory lock failed');
    if (isLeader) {
      demoteLeader('Database connection failure');
    }
  }
}

function promoteToLeader() {
  isLeader = true;
  schedulerLogger.info(
    { instanceId: schedulerInstanceId },
    'Scheduler node promoted to LEADER via PostgreSQL Advisory Lock. Activating loops.'
  );

  if (!cleanupTimer) {
    cleanupTimer = setInterval(async () => {
      if (!isLeader) return;
      try {
        const queue = getExecutionQueue();
        await queue.clean(24 * 60 * 60 * 1000, 1000, 'completed');
        await queue.clean(7 * 24 * 60 * 60 * 1000, 1000, 'failed');

        // Trigger Event Ledger Lifecycle Policy Sweep autonomously
        const { runEventLedgerLifecycleSweep } = await import('@/lib/runtime/ledger');
        await runEventLedgerLifecycleSweep();
      } catch (err) {
        schedulerLogger.error({ err }, 'Error during completed/failed jobs clean-up and ledger lifecycle sweep');
      }
    }, runtimeSettings.schedulerCleanupIntervalMs);
  }


  if (!reconciliationTimer) {
    reconciliationTimer = setInterval(async () => {
      if (!isLeader) return;
      await reconcileOrphanExecutions();
      await auditQueueAndWorkerHealth();
    }, 60 * 1000);
  }

  void reconcileOrphanExecutions().catch((err) => {
    schedulerLogger.error({ err }, 'Initial post-promotion reconciliation failed');
  });
  void auditQueueAndWorkerHealth().catch((err) => {
    schedulerLogger.error({ err }, 'Initial post-promotion health audit failed');
  });
}

function demoteLeader(reason: string) {
  isLeader = false;
  schedulerLogger.warn(
    { instanceId: schedulerInstanceId, reason },
    'Scheduler node DEMOTED from leader. Suspending loops.'
  );

  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
  if (reconciliationTimer) {
    clearInterval(reconciliationTimer);
    reconciliationTimer = null;
  }
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
      instanceId: schedulerInstanceId,
      executionQueueName: runtimeSettings.executionQueueName,
    },
    'Scheduler process initialized. Starting leadership election loop.'
  );

  await acquireOrRenewLeadership();
  if (!leadershipInterval) {
    leadershipInterval = setInterval(async () => {
      await acquireOrRenewLeadership();
    }, 3000);
  }

  return scheduler;
}

export async function closeQueueScheduler() {
  if (leadershipInterval) {
    clearInterval(leadershipInterval);
    leadershipInterval = null;
  }

  demoteLeader('Scheduler shutdown initiated');

  try {
    await prisma.$queryRaw`SELECT pg_advisory_unlock(${SCHEDULER_LOCK_ID})`;
  } catch (err) {
    // ignore lock release errors on shutdown
  }

  await Promise.all([scheduler?.close(), disconnectRedisClient(schedulerConnection)]);
  scheduler = null;
}

