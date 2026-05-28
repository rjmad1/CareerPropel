import { Job, Queue, Worker } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { createQueueJobOptions } from '@/lib/queue/retry-policy';
import { OUTREACH_RATE_LIMITS, QUEUE_NAMES } from '../constants';
import { outreachRepository } from '../repositories/outreachRepository';
import type { OutreachGenerationJobData } from './outreachGenerationWorker';

const logger = createLogger({ component: 'followup-worker' });

export interface FollowupJobData {
  campaignId: string;
  contactId: string;
  candidateId: string;
  currentStep: number;
  channel: 'LINKEDIN' | 'EMAIL' | 'PHONE';
  context: OutreachGenerationJobData['context'];
}

let worker: Worker<FollowupJobData> | null = null;

async function processFollowup(job: Job<FollowupJobData>) {
  const { campaignId, contactId, candidateId, currentStep, channel, context } = job.data;

  // Check if contact has already replied — if so, skip
  const latest = await outreachRepository.findSequenceNext(campaignId, contactId);
  if (!latest) {
    // Check if there's a replied outreach for this contact+campaign
    const replied = await outreachRepository.findByCampaignAndStatus(campaignId, 'REPLIED');
    const contactReplied = replied.some((o) => o.contactId === contactId);
    if (contactReplied) {
      logger.info({ contactId, campaignId }, 'Contact replied — skipping follow-up');
      return { skipped: true, reason: 'already_replied' };
    }
  }

  const nextStep = currentStep + 1;
  if (nextStep >= OUTREACH_RATE_LIMITS.maxPerContact) {
    logger.info({ contactId, campaignId, nextStep }, 'Max sequence steps reached');
    return { skipped: true, reason: 'max_steps_reached' };
  }

  const delayDays = OUTREACH_RATE_LIMITS.sequenceDelays[nextStep] ?? 14;
  const scheduledAt = new Date(Date.now() + delayDays * 86_400_000);

  // Queue the next outreach generation
  const genQueue = new Queue<OutreachGenerationJobData>(QUEUE_NAMES.OUTREACH_GENERATION, {
    connection: createRedisClient('career-propel:outreach-generation'),
    defaultJobOptions: createQueueJobOptions(),
  });

  await genQueue.add(
    'generate-followup',
    {
      candidateId,
      contactId,
      campaignId,
      channel,
      sequenceStep: nextStep,
      context,
    },
    { ...createQueueJobOptions(), delay: delayDays * 86_400_000 },
  );

  await genQueue.close();

  logger.info({ contactId, nextStep, scheduledAt }, 'Follow-up scheduled');
  return { nextStep, scheduledAt };
}

export function createFollowupWorker() {
  if (worker) return worker;

  const connection = createRedisClient('career-propel:followup-worker');
  worker = new Worker<FollowupJobData>(
    QUEUE_NAMES.FOLLOWUP_ORCHESTRATION,
    processFollowup,
    { connection, concurrency: 5, autorun: false },
  );

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Follow-up job failed');
  });

  return worker;
}
