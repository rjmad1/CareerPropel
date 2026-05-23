import { Queue } from 'bullmq';
import { prisma } from '@/lib/db';
import { log } from '@/lib/logging/logger';
import {
  AGENT_QUEUE_NAME,
  HEALTH_CHECK_INTERVAL,
  STALLED_TIMEOUT_MS,
  JOB_DEFAULTS,
  createBullMQRedisConnection,
} from './job-definitions';

const heartbeatRedis = createBullMQRedisConnection();

async function monitorQueueHealth(queue: Queue): Promise<void> {
  try {
    const counts = await queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    const paused = await queue.isPaused();
    const snapshot = { ...counts, paused, ts: new Date().toISOString() };
    await heartbeatRedis.setex('queue:health', 60, JSON.stringify(snapshot));
    log.info(snapshot, 'Queue health snapshot');
  } catch (err) {
    log.error({ err }, 'Queue health monitor error');
  }
}

async function detectStalledJobs(queue: Queue): Promise<void> {
  try {
    const active = await queue.getJobs(['active']);
    const now = Date.now();
    for (const job of active) {
      const hbRaw = await heartbeatRedis.get(`heartbeat:${job.id}`);
      const lastSeen = hbRaw
        ? JSON.parse(hbRaw).ts
        : (job.processedOn ?? now);
      const elapsed = now - lastSeen;
      if (elapsed > STALLED_TIMEOUT_MS) {
        log.warn({ jobId: job.id, executionId: job.data.executionId, elapsedMs: elapsed },
          'Stalled job detected — interrupting');
        await interruptJob(job, 'stall_detected');
      }
    }
  } catch (err) {
    log.error({ err }, 'Stall detection error');
  }
}

async function interruptJob(job: any, reason: 'stall_detected' | 'deploy_shutdown'): Promise<void> {
  try {
    await prisma.agentExecution.update({
      where: { id: job.data.executionId },
      data: {
        status: 'interrupted',
        interruptedAt: new Date(),
        interruptionReason: reason,
      },
    });
    await job.remove();
    log.warn({ executionId: job.data.executionId, reason }, 'Job interrupted');
  } catch (err) {
    log.error({ err, jobId: job.id }, 'Failed to interrupt job');
  }
}

async function handleInterruptedJobs(queue: Queue): Promise<void> {
  try {
    const since = new Date(Date.now() - 60_000);
    const interrupted = await prisma.agentExecution.findMany({
      where: { status: 'interrupted', interruptedAt: { gte: since } },
    });
    for (const exec of interrupted) {
      const context = exec.input ? JSON.parse(exec.input) : {};
      await queue.add('agent-execution', {
        executionId: exec.id,
        agentType: exec.agentType,
        userId: exec.userId,
        context,
        schemaVersion: 1,
        executionVersion: 1,
      }, { ...JOB_DEFAULTS, delay: 5000 });
      await prisma.agentExecution.update({
        where: { id: exec.id },
        data: { status: 'queued', retryCount: { increment: 1 } },
      });
      log.info({ executionId: exec.id, reason: exec.interruptionReason }, 'Interrupted job requeued');
    }
  } catch (err) {
    log.error({ err }, 'Interrupted job recovery error');
  }
}

export function startQueueScheduler(): { stop: () => void } {
  const queue = new Queue(AGENT_QUEUE_NAME, { connection: createBullMQRedisConnection() });

  const interval = setInterval(async () => {
    await monitorQueueHealth(queue);
    await detectStalledJobs(queue);
    await handleInterruptedJobs(queue);
  }, HEALTH_CHECK_INTERVAL);

  log.info({ queueName: AGENT_QUEUE_NAME }, 'Queue scheduler started');

  return {
    stop: async () => {
      clearInterval(interval);
      await queue.close();
      log.info('Queue scheduler stopped');
    },
  };
}
