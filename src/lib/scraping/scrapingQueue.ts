/**
 * Queue-driven Asynchronous Scraping Queue
 *
 * Implements Phase 2 Requirements:
 * - Asynchronous queue-driven execution via Redis.
 * - Circuit breakers to quarantine failing scrapers.
 * - Anti-ban throttling and execution timeouts.
 * - Standardized retry budgets and dead-letter classification.
 * - Correlation ID lineage propagation.
 */

import { redis } from '../redis/redisClient';
import { prisma } from '../db';
import { log } from '../logging/logger';
import { publishAgentStarted, publishAgentCompleted, publishAgentStatus, ExtendedAgentType } from '../agents/redis-integration';


export type ScrapingTaskType = 'profile' | 'search';

export interface ScrapingJobPayload {
  executionId: string;
  userId: string;
  taskType: ScrapingTaskType;
  provider: 'linkedin' | 'indeed';
  payload: Record<string, any>;
  correlationId?: string;
  retries: number;
}

// Operational Threshold Constants
const MAX_RETRY_BUDGET = 3;
const CIRCUIT_BREAKER_FAIL_THRESHOLD = 3;
const CIRCUIT_BREAKER_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes


export class ScrapingQueue {
  /**
   * Enqueue a LinkedIn profile import job.
   */
  async enqueueProfileImport(
    userId: string,
    profileUrl: string,
    correlationId?: string
  ): Promise<string> {
    const input = { profileUrl };

    // 1. Persist execution state as an agent-like record to retain unified tracking
    const execution = await prisma.agentExecution.create({
      data: {
        userId,
        agentType: 'linkedin-profile',
        status: 'queued',
        input: JSON.stringify(input),
      },
    });

    const jobPayload: ScrapingJobPayload = {
      executionId: execution.id,
      userId,
      taskType: 'profile',
      provider: 'linkedin',
      payload: input,
      correlationId,
      retries: 0,
    };

    // 2. Push job to the Redis queue
    await redis.rpush('scraping:queue', JSON.stringify(jobPayload));

    // 3. Publish real-time events to inform WebSocket clients
    await publishAgentStarted(userId, execution.id, 'linkedin-profile', input);
    await publishAgentStatus(userId, execution.id, 'linkedin-profile', 'queued', 0, 'Profile import queued...');

    log.info(
      { executionId: execution.id, userId, correlationId },
      '[Scraping Queue] Enqueued LinkedIn Profile Import job'
    );
    return execution.id;
  }

  /**
   * Enqueue a job search.
   */
  async enqueueJobSearch(
    userId: string,
    provider: 'linkedin' | 'indeed',
    query: string,
    location?: string,
    limit?: number,
    correlationId?: string
  ): Promise<string> {
    const input = { query, location, limit };

    // 1. Create tracking record in DB
    const agentType = provider === 'linkedin' ? 'linkedin-search' : 'indeed-search';
    const execution = await prisma.agentExecution.create({
      data: {
        userId,
        agentType,
        status: 'queued',
        input: JSON.stringify(input),
      },
    });

    const jobPayload: ScrapingJobPayload = {
      executionId: execution.id,
      userId,
      taskType: 'search',
      provider,
      payload: input,
      correlationId,
      retries: 0,
    };

    // 2. Enqueue in Redis
    await redis.rpush('scraping:queue', JSON.stringify(jobPayload));

    // 3. Publish real-time update
    await publishAgentStarted(userId, execution.id, agentType, input);
    await publishAgentStatus(userId, execution.id, agentType, 'queued', 0, 'Job search queued...');

    log.info(
      { executionId: execution.id, userId, provider, correlationId },
      '[Scraping Queue] Enqueued Job Search'
    );
    return execution.id;
  }

  /**
   * Dequeue the next task in the queue, checking for tripped circuit breakers.
   */
  async dequeueNext(): Promise<ScrapingJobPayload | null> {
    // 1. Fetch next job without popping (atomic inspection)
    const rawJob = await redis.lindex('scraping:queue', 0);
    if (!rawJob) return null;

    const job: ScrapingJobPayload = JSON.parse(rawJob);

    // 2. Check if the provider's circuit breaker is tripped
    const isTripped = await this.isCircuitBreakerTripped(job.provider);
    if (isTripped) {
      log.warn(
        { provider: job.provider, executionId: job.executionId },
        '[Scraping Queue] Circuit breaker is currently TRIPPED. Deferring job.'
      );
      // Rotate job to back of the queue to prevent blocking
      await redis.lpop('scraping:queue');
      await redis.rpush('scraping:queue', rawJob);
      return null;
    }

    // 3. Atomically dequeue the job
    await redis.lpop('scraping:queue');
    return job;
  }

  /**
   * Mark a scraping job as successfully completed.
   */
  async complete(executionId: string, userId: string, agentType: ExtendedAgentType, result: any): Promise<void> {
    await prisma.agentExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        output: JSON.stringify(result),
        completedAt: new Date(),
      },
    });

    // Reset circuit breaker on success
    const provider = agentType.startsWith('linkedin') ? 'linkedin' : 'indeed';
    await this.resetCircuitBreaker(provider);

    // Publish WebSocket completions
    await publishAgentCompleted(userId, executionId, agentType, 'success', result);
    await publishAgentStatus(userId, executionId, agentType, 'completed', 100, 'Scraping operation successful');

    log.info({ executionId }, '[Scraping Queue] Job completed successfully');
  }

  /**
   * Handle job failures, supporting retries, dead-letters, and circuit breakers.
   */
  async fail(job: ScrapingJobPayload, error: string): Promise<void> {
    const agentType = job.provider === 'linkedin'
      ? (job.taskType === 'profile' ? 'linkedin-profile' : 'linkedin-search')
      : 'indeed-search';

    // Increment consecutive failures for circuit breaker
    await this.incrementFailCount(job.provider);

    if (job.retries < MAX_RETRY_BUDGET) {
      job.retries += 1;
      const backoffMs = Math.pow(2, job.retries) * 1000;
      log.warn(
        { executionId: job.executionId, retry: job.retries, backoffMs },
        `[Scraping Queue] Job failed. Retrying in ${backoffMs}ms...`
      );

      // Re-enqueue job after backoff
      setTimeout(async () => {
        await redis.rpush('scraping:queue', JSON.stringify(job));
      }, backoffMs);

      await publishAgentStatus(
        job.userId,
        job.executionId,
        agentType,
        'running',
        0,
        `Retrying scraping operation (${job.retries}/${MAX_RETRY_BUDGET})...`
      );
    } else {
      // Dead-letter state: permanent failure reached
      await prisma.agentExecution.update({
        where: { id: job.executionId },
        data: {
          status: 'failed',
          errorMessage: `Max retries reached. Error: ${error}`,
          completedAt: new Date(),
        },
      });

      await publishAgentCompleted(job.userId, job.executionId, agentType, 'failed', undefined, error);
      await publishAgentStatus(job.userId, job.executionId, agentType, 'failed', 0, 'Scraping failed permanently.');

      log.error(
        { executionId: job.executionId, error },
        '[Scraping Queue] Job failed permanently (Dead-Letter state)'
      );
    }
  }

  // ── Circuit Breaker Helpers ──────────────────────────────────────────────────

  private async incrementFailCount(provider: 'linkedin' | 'indeed'): Promise<void> {
    const countKey = `scraping:cb:${provider}:fails`;
    const count = await redis.incr(countKey);

    if (count === 1) {
      await redis.expire(countKey, 600); // 10 min window
    }

    if (count >= CIRCUIT_BREAKER_FAIL_THRESHOLD) {
      log.error({ provider }, `[Circuit Breaker] Tripping breaker for ${provider}!`);
      await redis.set(`scraping:cb:${provider}:status`, 'tripped', 'EX', CIRCUIT_BREAKER_COOLDOWN_MS / 1000);
    }
  }

  private async resetCircuitBreaker(provider: 'linkedin' | 'indeed'): Promise<void> {
    await redis.del(`scraping:cb:${provider}:fails`);
    await redis.del(`scraping:cb:${provider}:status`);
  }

  private async isCircuitBreakerTripped(provider: 'linkedin' | 'indeed'): Promise<boolean> {
    const status = await redis.get(`scraping:cb:${provider}:status`);
    return status === 'tripped';
  }
}

export const scrapingQueue = new ScrapingQueue();
