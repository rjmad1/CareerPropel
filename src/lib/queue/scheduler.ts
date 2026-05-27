import { createLogger } from '@/lib/logging/logger';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { runtimeSettings } from '@/lib/runtime/settings';
import { getExecutionQueue } from '@/lib/queue/queues';

const schedulerLogger = createLogger({ component: 'scheduler' });
const schedulerConnection = createRedisClient('career-propel:scheduler');

type SchedulerRuntime = {
  close(): Promise<void>;
  waitUntilReady(): Promise<void>;
};

let scheduler: SchedulerRuntime | null = null;
let cleanupTimer: NodeJS.Timeout | null = null;

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

  if (!cleanupTimer) {
    cleanupTimer = setInterval(async () => {
      const queue = getExecutionQueue();
      await queue.clean(24 * 60 * 60 * 1000, 1000, 'completed');
      await queue.clean(7 * 24 * 60 * 60 * 1000, 1000, 'failed');
    }, runtimeSettings.schedulerCleanupIntervalMs);
  }

  return scheduler;
}

export async function closeQueueScheduler() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }

  await Promise.all([scheduler?.close(), disconnectRedisClient(schedulerConnection)]);
  scheduler = null;
}
