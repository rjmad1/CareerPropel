import { EventEmitter } from 'events';
import { createLogger } from '@/lib/logging/logger';
import { createRedisClient, disconnectRedisClient } from '@/lib/redis/redisClient';
import { type ExecutionRealtimeEvent } from '@/lib/queue/events';
import crypto from 'crypto';

const realtimeLogger = createLogger({ component: 'shared-subscriber' });
const emitter = new EventEmitter();

// Safeguard max listeners to a sensible engineering limit
emitter.setMaxListeners(250);

let subscriber = createRedisClient('career-propel:realtime-subscriber');
let subscriberReady: Promise<void> | null = null;

// Registry to track connection state, prevent leaks, and govern lifecycles
interface SSEConnection {
  connectionId: string;
  userId: string;
  eventName: string;
  handler: (event: any) => void;
  registeredAt: Date;
  lastActive: number;
}

const connectionRegistry = new Map<string, SSEConnection>();
const userConnectionMap = new Map<string, string[]>(); // userId -> connectionIds[]

async function ensureSubscriber() {
  if (!subscriberReady) {
    subscriberReady = (async () => {
      subscriber.on('pmessage', (_pattern, channel, message) => {
        try {
          const event = JSON.parse(message);
          
          if (event.userId) {
            emitter.emit(`user:${event.userId}`, event);
          }
          
          if (event.executionId) {
            emitter.emit(`execution:${event.executionId}`, event);
          }
          
          emitter.emit('event', event);
        } catch (error) {
          realtimeLogger.warn({ err: error, channel }, 'Failed to parse realtime event');
        }
      });

      await subscriber.psubscribe(
        'agent-events:*',
        'agent:status:*',
        'agent:executions:*',
        'queue:stats:*'
      );
      realtimeLogger.info('Shared realtime subscriber listening on channels: agent-events:*, agent:status:*, agent:executions:*, queue:stats:*');
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

export async function subscribeToUser(
  userId: string,
  handler: (event: any) => void
) {
  await ensureSubscriber();
  const eventName = `user:${userId}`;
  const connectionId = `conn:user:${crypto.randomUUID()}`;

  // Governance: enforce limit on parallel user connections to evict zombie sessions/tabs
  const activeUserConns = userConnectionMap.get(userId) || [];
  if (activeUserConns.length >= 5) {
    const oldestConnId = activeUserConns.shift();
    if (oldestConnId) {
      const oldestConn = connectionRegistry.get(oldestConnId);
      if (oldestConn) {
        emitter.off(oldestConn.eventName, oldestConn.handler);
        connectionRegistry.delete(oldestConnId);
        realtimeLogger.warn({ userId, connectionId: oldestConnId }, 'Evicted oldest stale user subscription due to connection limit (tab cap hit)');
      }
    }
  }

  const conn: SSEConnection = {
    connectionId,
    userId,
    eventName,
    handler,
    registeredAt: new Date(),
    lastActive: Date.now(),
  };

  connectionRegistry.set(connectionId, conn);
  activeUserConns.push(connectionId);
  userConnectionMap.set(userId, activeUserConns);

  emitter.on(eventName, handler);

  realtimeLogger.debug({ userId, connectionId, activeCount: activeUserConns.length }, 'User subscribed to SSE stream');

  return () => {
    emitter.off(eventName, handler);
    connectionRegistry.delete(connectionId);
    
    const userConns = userConnectionMap.get(userId) || [];
    const index = userConns.indexOf(connectionId);
    if (index !== -1) {
      userConns.splice(index, 1);
      if (userConns.length === 0) {
        userConnectionMap.delete(userId);
      } else {
        userConnectionMap.set(userId, userConns);
      }
    }
    realtimeLogger.debug({ userId, connectionId }, 'User unsubscribed from SSE stream');
  };
}

// Heartbeat updater called by SSE route to assert active connection health
export function keepAliveConnection(userId: string) {
  const activeUserConns = userConnectionMap.get(userId) || [];
  const now = Date.now();
  for (const connId of activeUserConns) {
    const conn = connectionRegistry.get(connId);
    if (conn) {
      conn.lastActive = now;
    }
  }
}

// Periodic cleanup of stale/zombie connections (run every 60 seconds)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes of no activity
    for (const [connId, conn] of connectionRegistry.entries()) {
      if (now - conn.lastActive > staleThreshold) {
        emitter.off(conn.eventName, conn.handler);
        connectionRegistry.delete(connId);
        
        // Remove from user mapping
        const userConns = userConnectionMap.get(conn.userId) || [];
        const index = userConns.indexOf(connId);
        if (index !== -1) {
          userConns.splice(index, 1);
          if (userConns.length === 0) {
            userConnectionMap.delete(conn.userId);
          } else {
            userConnectionMap.set(conn.userId, userConns);
          }
        }
        realtimeLogger.warn({ userId: conn.userId, connectionId: connId }, 'Swept stale zombie subscriber connection');
      }
    }
  }, 60 * 1000);
}

// Observability: SSE connection metrics
export function getSubscriberMetrics() {
  return {
    totalActiveListeners: connectionRegistry.size,
    totalUniqueUsers: userConnectionMap.size,
    listeners: Array.from(connectionRegistry.values()).map(c => ({
      connectionId: c.connectionId,
      userId: c.userId,
      registeredAt: c.registeredAt.toISOString(),
      ageSeconds: Math.round((Date.now() - c.registeredAt.getTime()) / 1000),
      lastActiveAgoSeconds: Math.round((Date.now() - c.lastActive) / 1000),
    })),
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
  connectionRegistry.clear();
  userConnectionMap.clear();
}
