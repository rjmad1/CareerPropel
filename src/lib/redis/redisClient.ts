import Redis from 'ioredis';
import { createLogger } from '@/lib/logging/logger';
import { recordRedisReconnect } from '@/lib/observability/runtime-metrics';
import { runtimeSettings } from '@/lib/runtime/settings';

const redisLogger = createLogger({ component: 'redis' });

const reconnectTimestamps = new Map<string, number[]>();
const lastAlertTimestamps = new Map<string, number>();

function trackReconnect(connectionName: string) {
  const now = Date.now();
  const attempts = reconnectTimestamps.get(connectionName) || [];
  attempts.push(now);

  // Filter to rolling 30-second window
  const windowStart = now - 30000;
  const recentAttempts = attempts.filter((ts) => ts >= windowStart);
  reconnectTimestamps.set(connectionName, recentAttempts);

  if (recentAttempts.length > 5) {
    const lastAlert = lastAlertTimestamps.get(connectionName) || 0;
    if (now - lastAlert > 60000) {
      redisLogger.error(
        {
          connectionName,
          reconnectCount: recentAttempts.length,
          windowSeconds: 30,
        },
        'Redis Reconnect Storm Detected! High reconnection frequency observed.'
      );
      lastAlertTimestamps.set(connectionName, now);
    }
  }
}

function buildRedisClient(connectionName: string) {
  const client = new Redis(runtimeSettings.redisUrl, {
    connectionName,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy(attempt) {
      return Math.min(1000 * attempt, 10000);
    },
    reconnectOnError() {
      return true;
    },
  });

  client.on('connect', () => {
    redisLogger.info({ connectionName }, 'Redis connected');
  });

  client.on('reconnecting', () => {
    redisLogger.warn({ connectionName }, 'Redis reconnecting');
    recordRedisReconnect();
    trackReconnect(connectionName);
  });

  client.on('error', (error) => {
    redisLogger.error({ connectionName, err: error }, 'Redis error');
  });

  return client;
}

const globalForRedis = globalThis as typeof globalThis & {
  __careerPropelRedis?: Redis;
};

export const redis = globalForRedis.__careerPropelRedis || buildRedisClient('career-propel:web');

if (!globalForRedis.__careerPropelRedis) {
  globalForRedis.__careerPropelRedis = redis;
}

export function createRedisClient(connectionName: string) {
  return buildRedisClient(connectionName);
}

export function createBullMQRedisConnection(connectionName = 'career-propel:bullmq') {
  return buildRedisClient(connectionName);
}

export async function disconnectRedisClient(client: Redis) {
  if (client.status === 'end') {
    return;
  }

  try {
    await client.quit();
  } catch {
    client.disconnect();
  }
}

export type RedisClient = Redis;
