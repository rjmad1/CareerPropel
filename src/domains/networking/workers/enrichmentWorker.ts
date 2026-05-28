import { Job, Worker } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { QUEUE_NAMES } from '../constants';
import { contactIntelligenceService } from '../services/contactIntelligenceService';
import { warmPathService } from '../services/warmPathService';
import type { EnrichmentJobData } from './discoveryWorker';

const logger = createLogger({ component: 'networking-enrichment-worker' });

let enrichmentWorker: Worker<EnrichmentJobData> | null = null;

async function processEnrichment(job: Job<EnrichmentJobData>) {
  const { contactId, candidateId } = job.data;
  logger.info({ contactId, candidateId }, 'Enriching contact');

  const [intelligence, warmPaths] = await Promise.all([
    contactIntelligenceService.enrichContact(contactId),
    warmPathService.detectWarmPaths(candidateId, contactId),
  ]);

  logger.info(
    { contactId, score: intelligence.influenceScore, warmPaths: warmPaths.length },
    'Contact enriched',
  );

  return { intelligence, warmPathsFound: warmPaths.length };
}

export function createEnrichmentWorker() {
  if (enrichmentWorker) return enrichmentWorker;

  const connection = createRedisClient('career-propel:networking-enrichment-worker');
  enrichmentWorker = new Worker<EnrichmentJobData>(
    QUEUE_NAMES.NETWORKING_ENRICHMENT,
    processEnrichment,
    { connection, concurrency: 5, autorun: false },
  );

  enrichmentWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Enrichment job failed');
  });

  return enrichmentWorker;
}
