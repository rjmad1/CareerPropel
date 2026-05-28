import { Job, Worker } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { QUEUE_NAMES } from '../constants';
import { engagementTrackingService } from '../services/engagementTrackingService';

const logger = createLogger({ component: 'engagement-tracking-worker' });

export interface EngagementTrackingJobData {
  outreachId: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  candidateId: string;
}

let worker: Worker<EngagementTrackingJobData> | null = null;

async function processEngagement(job: Job<EngagementTrackingJobData>) {
  const { outreachId, sentiment, candidateId } = job.data;
  logger.info({ outreachId, sentiment }, 'Processing engagement event');

  await engagementTrackingService.trackReply(outreachId, sentiment);
  await engagementTrackingService.recordMetric(candidateId, 'engagement_event', 1, sentiment);

  return { processed: true };
}

export function createEngagementTrackingWorker() {
  if (worker) return worker;

  const connection = createRedisClient('career-propel:engagement-tracking-worker');
  worker = new Worker<EngagementTrackingJobData>(
    QUEUE_NAMES.ENGAGEMENT_TRACKING,
    processEngagement,
    { connection, concurrency: 5, autorun: false },
  );

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Engagement tracking job failed');
  });

  return worker;
}
