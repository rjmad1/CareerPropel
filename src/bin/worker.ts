import * as Sentry from '@sentry/nextjs';
import { redactEvent } from '@/lib/observability/sentrySanitizer';
import { createLogger } from '@/lib/logging/logger';
import { startExecutionWorker } from '@/lib/queue/workers';
import { registerGracefulShutdown } from '@/lib/runtime/shutdown';
import { startWorkerHeartbeat } from '@/lib/queue/health';
import { enforceStartupGates } from '@/lib/runtime/startup-validator';
import {
  createDiscoveryWorker,
  createEnrichmentWorker,
  createOutreachGenerationWorker,
  createFollowupWorker,
  createEngagementTrackingWorker,
} from '@/domains/networking/workers';

// Initialize Sentry for the worker process
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  debug: false,
  beforeSend(event) {
    return redactEvent(event);
  },
});

const workerLogger = createLogger({ runtime: 'worker' });

async function main() {
  // Enforce startup gates
  await enforceStartupGates();

  // Start worker heartbeats
  const stopExecutionHb = startWorkerHeartbeat('execution-worker');
  const stopDiscoveryHb = startWorkerHeartbeat('networking-discovery');
  const stopEnrichmentHb = startWorkerHeartbeat('networking-enrichment');
  const stopOutreachHb = startWorkerHeartbeat('outreach-generation');
  const stopFollowupHb = startWorkerHeartbeat('followup-orchestration');
  const stopEngagementHb = startWorkerHeartbeat('engagement-tracking');

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
    stopExecutionHb,
    stopDiscoveryHb,
    stopEnrichmentHb,
    stopOutreachHb,
    stopFollowupHb,
    stopEngagementHb,
  ]);

  // Start the execution worker and networking workers
  const [executionWorker] = await Promise.all([
    startExecutionWorker(),
    discoveryWorker.run(),
    enrichmentWorker.run(),
    outreachGenWorker.run(),
    followupWorker.run(),
    engagementWorker.run(),
  ]);

  // Wire Sentry failed event listener for the execution worker
  executionWorker.on('failed', (job, error) => {
    Sentry.withScope((scope) => {
      if (job) {
        scope.setTags({
          executionId: job.data?.executionId,
          requestId: job.data?.requestId,
          correlationId: job.data?.correlationId,
          queueJobId: job.id,
          agentType: job.data?.agentType,
        });
      }
      Sentry.captureException(error);
    });
  });

  // Wire Sentry failed event listeners for the networking workers
  const netWorkers = [
    { name: 'networking-discovery', worker: discoveryWorker },
    { name: 'networking-enrichment', worker: enrichmentWorker },
    { name: 'outreach-generation', worker: outreachGenWorker },
    { name: 'followup-orchestration', worker: followupWorker },
    { name: 'engagement-tracking', worker: engagementWorker },
  ];

  for (const { name, worker } of netWorkers) {
    worker.on('failed', (job, error) => {
      Sentry.withScope((scope) => {
        if (job) {
          scope.setTags({
            queueName: name,
            queueJobId: job.id,
          });
        }
        Sentry.captureException(error);
      });
    });
  }

  workerLogger.info('Worker runtime started (execution + 5 networking workers) with Sentry observability');
}

void main().catch((error) => {
  Sentry.captureException(error);
  workerLogger.error({ err: error }, 'Worker runtime failed to start');
  process.exit(1);
});
