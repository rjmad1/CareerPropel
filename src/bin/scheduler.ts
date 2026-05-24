import { createLogger } from '@/lib/logging/logger';
import { startQueueScheduler } from '@/lib/queue/scheduler';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';

const schedulerLogger = createLogger({ runtime: 'scheduler' });

async function main() {
  registerGracefulShutdown('scheduler');
  await startQueueScheduler();
  schedulerLogger.info('Scheduler runtime started');
}

void main().catch((error) => {
  schedulerLogger.error({ err: error }, 'Scheduler runtime failed to start');
  process.exit(1);
});
