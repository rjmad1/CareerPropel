import { createLogger } from '@/lib/logging/logger';
import { startQueueScheduler } from '@/lib/queue/scheduler';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';
import { startWorkerHeartbeat } from '@/lib/queue/health';
import { enforceStartupGates } from '@/lib/runtime/startup-validator';

const schedulerLogger = createLogger({ runtime: 'scheduler' });

async function main() {
  await enforceStartupGates();
  const stopSchedulerHb = startWorkerHeartbeat('scheduler-process');
  registerGracefulShutdown('scheduler', [stopSchedulerHb]);
  await startQueueScheduler();
  schedulerLogger.info('Scheduler runtime started');
}

void main().catch((error) => {
  schedulerLogger.error({ err: error }, 'Scheduler runtime failed to start');
  process.exit(1);
});
