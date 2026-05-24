import Redis from 'ioredis';
import { createLogger } from '@/lib/logging/logger';
import { runtimeSettings } from '@/lib/runtime/settings';

const redisLogger = createLogger({ component: 'redis' });

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
