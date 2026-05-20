import 'server-only';
import { RedisOptions } from 'ioredis';
import { env } from '@/config/env';

export interface RedisConfig extends RedisOptions {
  connectTimeout: number;
  maxRetryDelay: number;
  retryBudget: number;
}

/**
 * Enterprise Redis Client configuration.
 * Enforces lazyConnect to prevent connections during build/static generation phase.
 */
export const redisConfig: RedisConfig = {
  ...parseRedisUrl(env.REDIS_URL),
  
  lazyConnect: true, // MANDATORY: Defer all socket connection requests
  maxRetriesPerRequest: null, // Required for blocking queue operations
  enableReadyCheck: false,
  
  // Connection timeout governance (7. OPERATIONAL SAFETY)
  connectTimeout: 10000, // 10 seconds max connection wait
  
  // Bounded retries & retry budget limits (7. OPERATIONAL SAFETY)
  maxRetryDelay: 5000, // Max delay between connection retries is 5 seconds
  retryBudget: 10, // Max number of retries before degrading
  
  retryStrategy(times: number) {
    if (times > redisConfig.retryBudget) {
      console.warn(`[Redis Config] Retry budget of ${redisConfig.retryBudget} exhausted. Gracefully degrading operations.`);
      return null; // Exhausted: return null to fail operation instead of looping infinitely
    }
    
    // Exponential backoff retry strategy with slight randomized jitter
    const delay = Math.min(times * 200 + Math.random() * 100, redisConfig.maxRetryDelay);
    console.warn(`[Redis Config] Client disconnected. Attempting retry #${times} in ${Math.round(delay)}ms...`);
    return delay;
  }
};

/**
 * Parses the validated REDIS_URL into discrete Redis options
 */
function parseRedisUrl(urlStr: string): Partial<RedisOptions> {
  try {
    const url = new URL(urlStr);
    return {
      host: url.hostname,
      port: parseInt(url.port || '6379'),
      username: url.username || undefined,
      password: url.password || undefined,
      db: parseInt(url.pathname.substring(1) || '0'),
      // Add secure TLS options if connecting via rediss protocol (production environments)
      tls: url.protocol === 'rediss:' ? { rejectUnauthorized: false } : undefined,
    };
  } catch (err) {
    console.error(`[Redis Config] Error parsing REDIS_URL: ${urlStr}. Falling back to default settings.`);
    return {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
    };
  }
}
