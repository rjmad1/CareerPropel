import { Queue } from 'bullmq';
import IORedis from 'ioredis';

export interface AgentJobData {
  executionId: string;
  agentType: string;
  userId: string;
  context: Record<string, unknown>;
  idempotencyKey?: string;
  schemaVersion: number;
  executionVersion: number;
}

export const AGENT_QUEUE_NAME = 'agent-execution';

export const SCHEMA_VERSION = 1;
export const EXECUTION_VERSION = 1;

// BullMQ needs its own direct ioredis connection — cannot share the singleton proxy
// used by the Next.js app because (a) it's marked server-only, and (b) BullMQ
// duplicates the connection internally for its pub/sub subscriber.
export function createBullMQRedisConnection(): IORedis {
  const url = process.env.REDIS_URL;
  if (url) {
    return new IORedis(url, { maxRetriesPerRequest: null, enableReadyCheck: false });
  }
  return new IORedis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });
}

export const JOB_DEFAULTS = {
  attempts: 3,
  backoff: { type: 'exponential' as const, delay: 2000 },
  removeOnComplete: { age: 3600 },   // keep completed jobs 1h
  removeOnFail:     { age: 86400 },  // keep failed jobs 24h
};

export const WORKER_CONFIG = {
  concurrency: 2,
  stalledInterval: 5000,
  maxStalledCount: 2,
};

export const STALLED_TIMEOUT_MS   = 60_000;
export const DRAIN_TIMEOUT_MS     = 120_000;
export const HEALTH_CHECK_INTERVAL = 10_000;

let _queue: Queue<AgentJobData> | null = null;

export function getAgentQueue(): Queue<AgentJobData> {
  if (!_queue) {
    _queue = new Queue<AgentJobData>(AGENT_QUEUE_NAME, {
      connection: createBullMQRedisConnection(),
    });
  }
  return _queue;
}
