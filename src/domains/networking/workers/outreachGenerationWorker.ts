import { Job, Worker } from 'bullmq';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient } from '@/lib/redis/redisClient';
import { OUTREACH_RATE_LIMITS, QUEUE_NAMES } from '../constants';
import { outreachRepository } from '../repositories/outreachRepository';
import { outreachGenerationService } from '../services/outreachGenerationService';
import { OutreachRequest } from '../types';

const logger = createLogger({ component: 'outreach-generation-worker' });

export interface OutreachGenerationJobData extends OutreachRequest {
  candidateId: string;
}

let worker: Worker<OutreachGenerationJobData> | null = null;

async function processOutreachGeneration(job: Job<OutreachGenerationJobData>) {
  const { candidateId, ...req } = job.data;

  // Rate limit check
  const todaySent = await outreachRepository.countTodaySent(candidateId);
  if (todaySent >= OUTREACH_RATE_LIMITS.maxPerDay) {
    logger.warn({ candidateId, todaySent }, 'Daily outreach rate limit reached, skipping');
    return { skipped: true, reason: 'rate_limit' };
  }

  const generated = await outreachGenerationService.generateOutreach(req);

  // Safety gate: if any hard safety rule fails (except REQUIRE_HUMAN_APPROVAL which always fails),
  // do not create the outreach record
  const hardFailures = generated.safetyChecks.filter(
    (c) => !c.passed && c.rule !== 'REQUIRE_HUMAN_APPROVAL',
  );

  if (hardFailures.length > 0) {
    logger.warn(
      { contactId: req.contactId, failures: hardFailures.map((f) => f.rule) },
      'Outreach blocked by safety rules',
    );
    return { skipped: true, reason: 'safety_failure', failures: hardFailures.map((f) => f.rule) };
  }

  // Create DRAFT record awaiting human approval
  const outreach = await outreachRepository.create({
    campaignId: req.campaignId,
    contactId: req.contactId,
    channel: req.channel,
    message: generated.message,
    personalizedMessage: generated.personalizedMessage,
    sequenceStep: req.sequenceStep,
  });

  logger.info({ outreachId: outreach.id, contactId: req.contactId }, 'Outreach draft created, awaiting approval');
  return { outreachId: outreach.id, status: 'pending_approval' };
}

export function createOutreachGenerationWorker() {
  if (worker) return worker;

  const connection = createRedisClient('career-propel:outreach-generation-worker');
  worker = new Worker<OutreachGenerationJobData>(
    QUEUE_NAMES.OUTREACH_GENERATION,
    processOutreachGeneration,
    { connection, concurrency: 2, autorun: false },
  );

  worker.on('failed', (job, err) => {
    logger.error({ err, jobId: job?.id }, 'Outreach generation failed');
  });

  return worker;
}
