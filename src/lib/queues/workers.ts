import { jobQueue, type AgentType, type QueuedJob } from './jobQueue';
import { redis } from '../redis/redisClient';

interface WorkerConfig {
  agentTypes: AgentType[];
  pollIntervalMs: number;
}

export class QueueWorker {
  private isRunning = false;
  private config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log(
      `[Worker] Starting queue worker for: ${this.config.agentTypes.join(', ')}`
    );

    while (this.isRunning) {
      try {
        for (const agentType of this.config.agentTypes) {
          const job = await jobQueue.dequeueNext(agentType);

          if (job) {
            await this.processJob(job);
          }
        }

        await new Promise((resolve) =>
          setTimeout(resolve, this.config.pollIntervalMs)
        );
      } catch (err) {
        console.error('[Worker] Error in poll loop:', err);
        await new Promise((resolve) =>
          setTimeout(resolve, this.config.pollIntervalMs * 2)
        );
      }
    }
  }

  stop(): void {
    this.isRunning = false;
    console.log('[Worker] Stopping queue worker');
  }

  private async processJob(job: QueuedJob): Promise<void> {
    console.log(
      `[Worker] Processing ${job.agentType} for job ${job.jobId}`
    );

    try {
      const result = await this.executeAgent(job);
      await jobQueue.complete(job.id, result);

      await redis.publish(
        `job:progress:${job.jobId}`,
        JSON.stringify({
          agentType: job.agentType,
          status: 'completed',
          result,
        })
      );
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[Worker] Error processing job:`, error);

      const shouldRetry = await jobQueue.fail(job.id, error);

      await redis.publish(
        `job:progress:${job.jobId}`,
        JSON.stringify({
          agentType: job.agentType,
          status: shouldRetry ? 'retrying' : 'failed',
          error,
        })
      );
    }
  }

  private async executeAgent(job: QueuedJob): Promise<any> {
    switch (job.agentType) {
      case 'resume-tailor':
        return this.runResumeTailorAgent(job);
      case 'job-matcher':
        return this.runJobMatcherAgent(job);
      case 'application':
        return this.runApplicationAgent(job);
      case 'research':
        return this.runResearchAgent(job);
      case 'interview-prep':
        return this.runInterviewPrepAgent(job);
      case 'follow-up':
        return this.runFollowUpAgent(job);
      default:
        throw new Error(`Unknown agent type: ${job.agentType}`);
    }
  }

  private async runResumeTailorAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Resume Tailor: ${job.jobId}`);
    return { tailored: true, version: 'v2' };
  }

  private async runJobMatcherAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Job Matcher: ${job.jobId}`);
    return { matchScore: 82, confidence: 0.92 };
  }

  private async runApplicationAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Application: ${job.jobId}`);
    return { applied: true, timestamp: Date.now() };
  }

  private async runResearchAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Research: ${job.jobId}`);
    return { companySize: 500, founded: 2015 };
  }

  private async runInterviewPrepAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Interview Prep: ${job.jobId}`);
    return {
      behavioralStories: 5,
      technicalTopics: 12,
      companyInsights: 8,
    };
  }

  private async runFollowUpAgent(job: QueuedJob): Promise<any> {
    console.log(`[Agent] Follow Up: ${job.jobId}`);
    return {
      messageSent: true,
      nextFollowUp: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
  }
}

export function createQueueWorker(
  agentTypes: AgentType[] = [
    'resume-tailor',
    'job-matcher',
    'application',
    'research',
    'interview-prep',
    'follow-up',
  ],
  pollIntervalMs: number = 1000
): QueueWorker {
  return new QueueWorker({
    agentTypes,
    pollIntervalMs,
  });
}
