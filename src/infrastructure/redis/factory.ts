import 'server-only';
import Redis from 'ioredis';
import { redisConfig } from './config';

/**
 * Creates and registers observability hooks on a new Redis client instance
 */
export function createRedisClient(): Redis {
  console.log('[Redis Factory] Instantiating new ioredis client (lazyConnect=true)...');
  const client = new Redis(redisConfig);

  // Connection observability hooks (6. OPERATIONAL SAFETY & 8. OBSERVABILITY)
  client.on('connect', () => {
    console.log('[Redis Observability] Socket connection initiated.');
  });

  client.on('ready', () => {
    console.log('[Redis Observability] Client is fully ready to receive commands.');
  });

  client.on('error', (err) => {
    console.error('[Redis Observability] Client error occurred:', err.message);
  });

  client.on('close', () => {
    console.warn('[Redis Observability] Socket connection closed.');
  });

  client.on('reconnecting', () => {
    console.log('[Redis Observability] Reconnecting client socket...');
  });

  return client;
}
