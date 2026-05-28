import { Job, Queue, Worker } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { createQueueJobOptions } from '@/lib/queue/retry-policy';
import { QUEUE_NAMES } from '../constants';
import { contactRepository } from '../repositories/contactRepository';
import { recruiterDiscoveryService } from '../services/recruiterDiscoveryService';
import { RecruiterDiscoveryRequest } from '../types';

const logger = createLogger({ component: 'networking-discovery-worker' });

export interface DiscoveryJobData extends RecruiterDiscoveryRequest {
  candidateId: string;
  userId: string;
}

export interface EnrichmentJobData {
  contactId: string;
  candidateId: string;
}

let discoveryWorker: Worker<DiscoveryJobData> | null = null;
let enrichmentQueue: Queue<EnrichmentJobData> | null = null;

function getEnrichmentQueue() {
  if (!enrichmentQueue) {
    enrichmentQueue = new Queue<EnrichmentJobData>(QUEUE_NAMES.NETWORKING_ENRICHMENT, {
      connection: createRedisClient('career-propel:networking-enrichment'),
      defaultJobOptions: createQueueJobOptions(),
    });
  }
  return enrichmentQueue;
}

async function processDiscovery(job: Job<DiscoveryJobData>) {
  const { candidateId, userId, ...req } = job.data;
  logger.info({ candidateId, company: req.company }, 'Processing discovery job');

  const discovered = await recruiterDiscoveryService.discoverRecruiters(req);

  let upserted = 0;
  const enrichQueue = getEnrichmentQueue();

  for (const recruiter of discovered) {
    try {
      const contact = await contactRepository.upsertDiscovered(candidateId, recruiter);
      await enrichQueue.add(
        'enrich-contact',
        { contactId: contact.id, candidateId },
        createQueueJobOptions(),
      );
      upserted++;
    } catch (err) {
      logger.warn({ err, name: recruiter.name }, 'Failed to upsert discovered recruiter');
    }
  }

  logger.info({ candidateId, upserted }, 'Discovery complete');
  return { discovered: discovered.length, upserted };
}

export function createDiscoveryWorker() {
  if (discoveryWorker) return discoveryWorker;

  const connection = createRedisClient('career-propel:networking-discovery-worker');
  discoveryWorker = new Worker<DiscoveryJobData>(
    QUEUE_NAMES.NETWORKING_DISCOVERY,
    processDiscovery,
    { connection, concurrency: 3, autorun: false },
  );

  discoveryWorker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Discovery job failed');
  });

  return discoveryWorker;
}

export async function enqueueDiscovery(data: DiscoveryJobData) {
  const queue = new Queue<DiscoveryJobData>(QUEUE_NAMES.NETWORKING_DISCOVERY, {
    connection: createRedisClient('career-propel:networking-discovery'),
    defaultJobOptions: createQueueJobOptions(),
  });
  const result = await queue.add('discover-recruiters', data, createQueueJobOptions());
  await queue.close();
  return result;
}
