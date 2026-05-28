import { createLogger } from '@/lib/logging/logger';
import { startQueueScheduler } from '@/lib/queue/scheduler';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';
import { startWorkerHeartbeat } from '@/lib/queue/health';

const schedulerLogger = createLogger({ runtime: 'scheduler' });

async function main() {
  const stopSchedulerHb = startWorkerHeartbeat('scheduler-process');
  registerGracefulShutdown('scheduler', [stopSchedulerHb]);
  await startQueueScheduler();
  schedulerLogger.info('Scheduler runtime started');
}

void main().catch((error) => {
  schedulerLogger.error({ err: error }, 'Scheduler runtime failed to start');
  process.exit(1);
});
