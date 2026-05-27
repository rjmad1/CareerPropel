import { ChildProcess } from 'child_process';
import { prisma } from '@/lib/db';
import { createLogger } from '@/lib/logging/logger';
import { closeExecutionWorker } from '@/lib/queue/workers';
import { closeQueueScheduler } from '@/lib/queue/scheduler';
import { closeQueues } from '@/lib/queue/queues';
import { closeSharedSubscriber } from '@/lib/realtime/sharedSubscriber';
import { disconnectRedisClient, redis } from '@/lib/redis/redisClient';

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
      if (childProcess && childProcess.pid) {
        childProcess.kill(signal as NodeJS.Signals);
      }

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
