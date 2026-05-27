import { EventEmitter } from 'events';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { type ExecutionRealtimeEvent } from '@/lib/queue/events';

const realtimeLogger = createLogger({ component: 'shared-subscriber' });
const emitter = new EventEmitter();
emitter.setMaxListeners(0);

let subscriber = createRedisClient('career-propel:realtime-subscriber');
let subscriberReady: Promise<void> | null = null;

async function ensureSubscriber() {
  if (!subscriberReady) {
    subscriberReady = (async () => {
      subscriber.on('pmessage', (_pattern, _channel, message) => {
        try {
          const event = JSON.parse(message) as ExecutionRealtimeEvent;
          emitter.emit(`execution:${event.executionId}`, event);
          emitter.emit(`user:${event.userId}`, event);
          emitter.emit('event', event);
        } catch (error) {
          realtimeLogger.warn({ err: error }, 'Failed to parse realtime event');
        }
      });

      await subscriber.psubscribe('agent-events:*');
    })().catch(async (error) => {
      subscriberReady = null;
      realtimeLogger.error({ err: error }, 'Failed to start shared realtime subscriber');
      throw error;
    });
  }

  await subscriberReady;
}

export async function subscribeToExecution(
  executionId: string,
  handler: (event: ExecutionRealtimeEvent) => void
) {
  await ensureSubscriber();
  const eventName = `execution:${executionId}`;
  emitter.on(eventName, handler);

  return () => {
    emitter.off(eventName, handler);
  };
}

export async function closeSharedSubscriber() {
  if (!subscriberReady) {
    return;
  }

  subscriber.removeAllListeners('pmessage');
  await disconnectRedisClient(subscriber);
  subscriber = createRedisClient('career-propel:realtime-subscriber');
  subscriberReady = null;
}
