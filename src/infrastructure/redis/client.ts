import 'server-only';
import Redis from 'ioredis';
import { createRedisClient } from './factory';
import { registerShutdownHook } from './health';

const globalForRedis = global as unknown as { redis?: Redis };

/**
 * Resolves the globally cached singleton client or instantiates a new one
 */
function getRedisInstance(): Redis {
  if (!globalForRedis.redis) {
    // 1. Instantiate the lazy client via factory
    const instance = createRedisClient();
    
    // 2. Register process shutdown hooks for signal handling
    registerShutdownHook(instance);
    
    // 3. Cache the singleton in the global scope (development hot-reload safety)
    globalForRedis.redis = instance;
  }
  return globalForRedis.redis;
}

/**
 * Enterprise Lazy Singleton Proxy.
 * Prevents any eager connections or side effects during the Next.js import graph traversal.
 */
export const redis = new Proxy({}, {
  get: (_, prop) => {
    // 1. Resolve client instance on property access
    const instance = getRedisInstance();
    const value = instance[prop as keyof Redis];
    
    // 2. Correctly bind methods to preserve the instance context
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    
    return value;
  },
}) as unknown as Redis;

export type RedisClient = Redis;
export { checkRedisHealth, executeSafely } from './health';
export { redisConfig } from './config';
