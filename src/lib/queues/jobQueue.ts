import { redis } from '../redis/redisClient';
import { randomUUID } from 'crypto';

export type AgentType =
  | 'resume-tailor'
  | 'job-matcher'
  | 'application'
  | 'research'
  | 'interview-prep'
  | 'follow-up';

export interface QueuedJob {
  id: string;
  agentType: AgentType;
  jobId: string;
  userId: string;
  payload: Record<string, any>;
  priority: number;
  retries: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: any;
}

interface QueueConfig {
  concurrencyLimits: Record<AgentType, number>;
  defaultMaxRetries: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  concurrencyLimits: {
    'resume-tailor': 2,
    'job-matcher': 3,
    'application': 2,
    'research': 3,
    'interview-prep': 2,
    'follow-up': 5,
  },
  defaultMaxRetries: 3,
};

export class JobQueue {
  private config: QueueConfig;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async enqueue(
    agentType: AgentType,
    jobId: string,
    userId: string,
    payload: Record<string, any>,
    priority: number = 5
  ): Promise<string> {
    const queuedJob: QueuedJob = {
      id: randomUUID(),
      agentType,
      jobId,
      userId,
      payload,
      priority,
      retries: 0,
      maxRetries: this.config.defaultMaxRetries,
      createdAt: Date.now(),
    };

    await redis.hset(
      `job:${queuedJob.id}`,
      'data',
      JSON.stringify(queuedJob)
    );

    const score = -priority * 1000000 + queuedJob.createdAt;
    await redis.zadd(`queue:${agentType}`, score, queuedJob.id);
    await redis.hset(`job:state:${jobId}`, 'agentType', agentType);
    await redis.hset(`job:state:${jobId}`, 'queuedJobId', queuedJob.id);

    console.log(`[Queue] Enqueued ${agentType} for job ${jobId}`);
    return queuedJob.id;
  }

  async dequeueNext(agentType: AgentType): Promise<QueuedJob | null> {
    const concurrencyLimit = this.config.concurrencyLimits[agentType];
    const runningCount = await redis.scard(`running:${agentType}`);

    if (runningCount >= concurrencyLimit) {
      return null;
    }

    const jobIds = await redis.zrange(`queue:${agentType}`, 0, 0);
    if (jobIds.length === 0) {
      return null;
    }

    const jobId = jobIds[0];
    const jobData = await redis.hget(`job:${jobId}`, 'data');

    if (!jobData) {
      await redis.zrem(`queue:${agentType}`, jobId);
      return this.dequeueNext(agentType);
    }

    const queuedJob: QueuedJob = JSON.parse(jobData);
    queuedJob.startedAt = Date.now();

    await redis.sadd(`running:${agentType}`, jobId);
    await redis.zrem(`queue:${agentType}`, jobId);
    await redis.hset(
      `job:${jobId}`,
      'data',
      JSON.stringify(queuedJob)
    );

    console.log(`[Queue] Dequeued ${agentType}: ${queuedJob.jobId}`);
    return queuedJob;
  }

  async complete(queuedJobId: string, result: any): Promise<void> {
    const jobData = await redis.hget(`job:${queuedJobId}`, 'data');
    if (!jobData) return;

    const queuedJob: QueuedJob = JSON.parse(jobData);
    queuedJob.completedAt = Date.now();
    queuedJob.result = result;

    await redis.srem(`running:${queuedJob.agentType}`, queuedJobId);
    await redis.hset(
      `job:${queuedJobId}`,
      'data',
      JSON.stringify(queuedJob)
    );

    await redis.publish(
      `job:completed:${queuedJob.jobId}`,
      JSON.stringify(queuedJob)
    );

    console.log(`[Queue] Completed ${queuedJob.agentType}: ${queuedJob.jobId}`);
  }

  async fail(queuedJobId: string, error: string): Promise<boolean> {
    const jobData = await redis.hget(`job:${queuedJobId}`, 'data');
    if (!jobData) return false;

    const queuedJob: QueuedJob = JSON.parse(jobData);
    queuedJob.retries += 1;
    queuedJob.error = error;

    await redis.srem(`running:${queuedJob.agentType}`, queuedJobId);

    if (queuedJob.retries < queuedJob.maxRetries) {
      const backoffMs = Math.pow(2, queuedJob.retries) * 1000;
      const retryScore = Date.now() + backoffMs;

      await redis.zadd(`queue:${queuedJob.agentType}`, retryScore, queuedJobId);
      await redis.hset(
        `job:${queuedJobId}`,
        'data',
        JSON.stringify(queuedJob)
      );

      console.log(
        `[Queue] Retry ${queuedJob.retries}/${queuedJob.maxRetries} for ${queuedJob.agentType}: ${queuedJob.jobId}`
      );
      return true;
    } else {
      await redis.hset(
        `job:${queuedJobId}`,
        'data',
        JSON.stringify(queuedJob)
      );

      await redis.publish(
        `job:failed:${queuedJob.jobId}`,
        JSON.stringify(queuedJob)
      );

      console.log(
        `[Queue] Failed (max retries) ${queuedJob.agentType}: ${queuedJob.jobId}`
      );
      return false;
    }
  }

  async getStats(agentType?: AgentType) {
    if (agentType) {
      const queuedCount = await redis.zcard(`queue:${agentType}`);
      const runningCount = await redis.scard(`running:${agentType}`);
      const limit = this.config.concurrencyLimits[agentType];

      return {
        agentType,
        queued: queuedCount,
        running: runningCount,
        concurrencyLimit: limit,
        available: Math.max(0, limit - runningCount),
      };
    }

    const allStats: Record<string, any> = {};
    for (const type of Object.keys(this.config.concurrencyLimits)) {
      allStats[type] = await this.getStats(type as AgentType);
    }
    return allStats;
  }

  watchJobCompletion(jobId: string, callback: (job: QueuedJob) => void) {
    const subscriber = redis.duplicate();

    subscriber.subscribe(`job:completed:${jobId}`, (err) => {
      if (err) {
        console.error('Failed to subscribe:', err);
      }
    });

    subscriber.on('message', (_channel, message) => {
      try {
        const job = JSON.parse(message) as QueuedJob;
        callback(job);
        subscriber.unsubscribe();
        subscriber.disconnect();
      } catch (err) {
        console.error('Error parsing job:', err);
      }
    });
  }
}

export const jobQueue = new JobQueue();
