/**
 * Shared Redis subscriber + in-process EventEmitter fanout for SSE connections.
 *
 * Problem solved: the previous architecture created one Redis subscriber connection
 * per SSE client. Under moderate load (50 clients) this exceeded Redis connection
 * limits and caused missed events. This module maintains ONE subscriber connection
 * and fans out received messages to all active SSE listeners via EventEmitter.
 */

import { EventEmitter } from 'events';
import IORedis from 'ioredis';
import { log } from '@/lib/logging/logger';

const emitter = new EventEmitter();
emitter.setMaxListeners(0); // unbounded — one listener per SSE connection

let subscriber: IORedis | null = null;

function createSubscriberConnection(): IORedis {
  const url = process.env.REDIS_URL;
  const conn = url
    ? new IORedis(url, { lazyConnect: true, enableReadyCheck: false, retryStrategy: (t) => (t > 5 ? null : Math.min(t * 500, 3000)) })
    : new IORedis({
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        password: process.env.REDIS_PASSWORD,
        lazyConnect: true,
        enableReadyCheck: false,
        retryStrategy: (t) => (t > 5 ? null : Math.min(t * 500, 3000)),
      });
  return conn;
}

export async function initializeSharedSubscriber(): Promise<EventEmitter> {
  if (subscriber) return emitter;

  subscriber = createSubscriberConnection();
  await subscriber.connect();

  subscriber.on('pmessage', (_pattern: string, channel: string, message: string) => {
    try {
      const event = JSON.parse(message);
      emitter.emit('redis-event', { channel, event });
    } catch {
      // malformed — ignore
    }
  });

  await subscriber.psubscribe('agent:*', 'queue:*');
  log.info('Shared Redis subscriber initialised (patterns: agent:*, queue:*)');

  subscriber.on('error', (err) => {
    log.error({ err }, 'Shared Redis subscriber error');
  });

  return emitter;
}

/**
 * Subscribe an SSE callback to all Redis events.
 * Returns an unsubscribe function — call it when the SSE connection closes.
 */
export function subscribeToEvents(
  callback: (channel: string, event: unknown) => void,
): () => void {
  const handler = ({ channel, event }: { channel: string; event: unknown }) => {
    callback(channel, event);
  };
  emitter.on('redis-event', handler);
  return () => emitter.off('redis-event', handler);
}

export async function shutdownSharedSubscriber(): Promise<void> {
  if (!subscriber) return;
  await subscriber.punsubscribe();
  await subscriber.quit();
  emitter.removeAllListeners();
  subscriber = null;
  log.info('Shared Redis subscriber shut down');
}
