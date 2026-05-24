import { createLogger } from '@/lib/logging/logger';
import { startExecutionWorker } from '@/lib/queue/workers';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';

const workerLogger = createLogger({ runtime: 'worker' });

async function main() {
  registerGracefulShutdown('worker');
  await startExecutionWorker();
  workerLogger.info('Worker runtime started');
}

void main().catch((error) => {
  workerLogger.error({ err: error }, 'Worker runtime failed to start');
  process.exit(1);
});
