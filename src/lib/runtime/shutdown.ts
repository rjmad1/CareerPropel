import { ChildProcess } from 'child_process';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { closeExecutionWorker } from '@/lib/queue/workers';
import { closeQueueScheduler } from '@/lib/queue/scheduler';
import { closeQueues } from '@/lib/queue/queues';
import { closeSharedSubscriber } from '@/lib/realtime/sharedSubscriber';
import { disconnectRedisClient, redis } from '@/lib/redis/redisClient';
import { setDrainMode } from '@/lib/runtime/deployment';

const shutdownLogger = createLogger({ component: 'shutdown' });

let shuttingDown = false;

export function registerGracefulShutdown(
  runtimeName: string,
  extraHandlers: Array<() => Promise<void>> = [],
  childProcess?: ChildProcess
) {
  const shutdown = async (signal: string) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    shutdownLogger.info({ runtimeName, signal }, 'Graceful shutdown started');

    try {
      // 1. Trigger worker drain mode so workers stop accepting new jobs
      await setDrainMode(true).catch((err) => {
        shutdownLogger.error({ err }, 'Failed to set worker drain mode on shutdown');
      });

      // 2. Publish SSE disconnect signal to notify all realtime clients
      await redis.publish('system:events', JSON.stringify({
        type: 'sse:disconnect',
        reason: 'deploy_shutdown',
        timestamp: new Date().toISOString()
      })).catch((err) => {
        shutdownLogger.error({ err }, 'Failed to publish SSE disconnect signal');
      });

      if (childProcess && childProcess.pid) {
        childProcess.kill(signal as NodeJS.Signals);
      }

      // 3. Await in-flight completion and close active worker, queue scheduler, and clients
      await Promise.allSettled([
        ...extraHandlers.map((handler) => handler()),
        closeExecutionWorker(),
        closeQueueScheduler(),
        closeQueues(),
        closeSharedSubscriber(),
        prisma.$disconnect(),
        disconnectRedisClient(redis),
      ]);
    } finally {
      shutdownLogger.info({ runtimeName, signal }, 'Graceful shutdown complete');
      process.exit(0);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

