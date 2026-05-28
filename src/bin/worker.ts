import { createLogger } from '@/lib/logging/logger';
import { startExecutionWorker } from '@/lib/queue/workers';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';
import {
  createDiscoveryWorker,
  createEnrichmentWorker,
  createOutreachGenerationWorker,
  createFollowupWorker,
  createEngagementTrackingWorker,
} from '@/domains/networking/workers';

const workerLogger = createLogger({ runtime: 'worker' });

async function main() {
  // Create networking workers (autorun: false — run() called below)
  const discoveryWorker = createDiscoveryWorker();
  const enrichmentWorker = createEnrichmentWorker();
  const outreachGenWorker = createOutreachGenerationWorker();
  const followupWorker = createFollowupWorker();
  const engagementWorker = createEngagementTrackingWorker();

  registerGracefulShutdown('worker', [
    () => discoveryWorker.close(),
    () => enrichmentWorker.close(),
    () => outreachGenWorker.close(),
    () => followupWorker.close(),
    () => engagementWorker.close(),
  ]);

  await Promise.all([
    startExecutionWorker(),
    discoveryWorker.run(),
    enrichmentWorker.run(),
    outreachGenWorker.run(),
    followupWorker.run(),
    engagementWorker.run(),
  ]);

  workerLogger.info('Worker runtime started (execution + 5 networking workers)');
}

void main().catch((error) => {
  workerLogger.error({ err: error }, 'Worker runtime failed to start');
  process.exit(1);
});
