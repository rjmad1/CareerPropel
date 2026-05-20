/**
 * WebSocket server connection manager
 * Handles client connections, Redis subscriptions, and message broadcasting
 *
 * Remediations applied:
 *   RASUI-004: redisSubscriber stored per-connection; quit() called on disconnect
 *   RASUI-004: redis.keys(pattern) replaced with cursor-based SCAN
 *   RASUI-010: Redis TLS uses rejectUnauthorized:true (see infrastructure/redis/config.ts)
 */

import { redis } from '@/lib/redis/redisClient';
import { REDIS_CHANNELS, RealtimeEvent, parseEvent, AgentType } from './events';
import { log } from '@/lib/logging/logger';
import type { Redis } from 'ioredis';

interface ClientConnection {
  id: string;
  userId: string;
  socket: any; // WebSocket
  subscriptions: Set<string>;
  lastHeartbeat: Date;
  /**
   * RASUI-004 fix: each connection owns its dedicated subscriber instance.
   * Must be quit() on disconnection to release the Redis connection.
   */
  redisSubscriber: Redis;
}

/**
 * In-memory store of active WebSocket connections.
 * Maps client IDs to their connection info.
 *
 * NOTE: This store is process-local. For horizontal scaling with multiple
 * Node processes, adopt @socket.io/redis-adapter so the Socket.io server
 * in server.js handles routing across processes.
 */
const activeConnections = new Map<string, ClientConnection>();

/**
 * Subscribe a client to agent updates for a specific user.
 *
 * RASUI-004 fix: creates a dedicated per-connection Redis subscriber that is
 * stored on the ClientConnection object. This ensures cleanup() can call
 * subscriber.quit() rather than incorrectly operating on the shared redis client.
 */
export async function subscribeToAgentUpdates(
  clientId: string,
  userId: string,
  socket: any
): Promise<void> {
  const channels = [
    REDIS_CHANNELS.AGENT_STATUS(userId),
    REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
    REDIS_CHANNELS.QUEUE_STATS(userId),
  ];

  // Duplicate creates a new connection scoped to this subscriber
  const redisSubscriber = redis.duplicate();

  const connection: ClientConnection = {
    id: clientId,
    userId,
    socket,
    subscriptions: new Set(channels),
    lastHeartbeat: new Date(),
    redisSubscriber,
  };

  try {
    redisSubscriber.on('message', (_channel: string, message: string) => {
      const event = parseEvent(message);
      if (event) {
        broadcastToUser(userId, event);
      }
    });

    redisSubscriber.on('error', (err) => {
      log.warn({ err, clientId, userId }, '[WS] Redis subscriber error');
    });

    await redisSubscriber.subscribe(...channels);

    activeConnections.set(clientId, connection);

    log.info(
      { clientId, userId, channelCount: channels.length },
      '[WS] Client subscribed to agent update channels'
    );
  } catch (error) {
    // If subscribe fails, clean up the duplicated connection immediately
    await redisSubscriber.quit().catch(() => {});
    log.error({ err: error, clientId }, '[WS] Failed to subscribe client');
    throw error;
  }
}

/**
 * Unsubscribe a client and clean up its connection.
 *
 * RASUI-004 fix: calls subscriber.quit() on the per-connection subscriber
 * rather than redis.unsubscribe() on the shared singleton client.
 */
export async function unsubscribeClient(clientId: string): Promise<void> {
  const connection = activeConnections.get(clientId);
  if (!connection) return;

  activeConnections.delete(clientId);

  try {
    // Properly shut down the per-connection subscriber
    await connection.redisSubscriber.quit();
    log.info({ clientId }, '[WS] Client disconnected and subscriber released');
  } catch (error) {
    log.warn({ err: error, clientId }, '[WS] Error during client unsubscribe');
    // Force disconnect as fallback if quit() fails
    try { connection.redisSubscriber.disconnect(); } catch { /* ignore */ }
  }
}

/**
 * Broadcast event to all connected clients for a specific user.
 */
export function broadcastToUser(userId: string, event: RealtimeEvent): void {
  let sentCount = 0;

  for (const [clientId, connection] of activeConnections) {
    if (connection.userId === userId) {
      try {
        connection.socket.send(JSON.stringify(event));
        sentCount++;
      } catch (error) {
        log.warn({ err: error, clientId }, '[WS] Failed to send to client; will be cleaned up on disconnect');
      }
    }
  }

  if (sentCount > 0) {
    log.debug({ userId, sentCount }, '[WS] Broadcast event to user connections');
  }
}

/**
 * Get current agent status for a user from Redis.
 */
export async function getAgentStatus(userId: string, agentType: AgentType): Promise<any | null> {
  try {
    const key = `agent:status:${userId}:${agentType}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    log.warn({ err: error, userId, agentType }, '[WS] Error fetching agent status');
    return null;
  }
}

/**
 * Get all agents' current status for a user.
 *
 * RASUI-004 fix: replaces redis.keys(pattern) [O(N) blocking] with cursor-based
 * SCAN iteration [O(1) per call, non-blocking, safe under large keyspaces].
 */
export async function getAllAgentStatus(userId: string): Promise<Record<string, any>> {
  const pattern = `agent:status:${userId}:*`;
  const statusMap: Record<string, any> = {};

  try {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const parts = key.split(':');
          const agentType = parts[3]; // agent:status:<userId>:<agentType>
          statusMap[agentType] = JSON.parse(data);
        }
      }
    } while (cursor !== '0');
  } catch (error) {
    log.warn({ err: error, userId }, '[WS] Error fetching all agent status');
  }

  return statusMap;
}

/**
 * Get active connections count (for monitoring).
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

/**
 * Get active connections for a specific user (for monitoring).
 */
export function getUserConnectionCount(userId: string): number {
  let count = 0;
  for (const connection of activeConnections.values()) {
    if (connection.userId === userId) count++;
  }
  return count;
}

/**
 * Heartbeat to keep connections alive.
 */
export async function sendHeartbeats(): Promise<void> {
  const heartbeat = {
    type: 'heartbeat',
    timestamp: new Date(),
  };

  let sentCount = 0;
  for (const [_clientId, connection] of activeConnections) {
    try {
      connection.socket.send(JSON.stringify(heartbeat));
      connection.lastHeartbeat = new Date();
      sentCount++;
    } catch {
      // Client connection is dead, will be cleaned up on disconnect
    }
  }

  if (sentCount > 0) {
    log.debug({ sentCount }, '[WS] Sent heartbeats to clients');
  }
}

/**
 * Clean up stale connections (no heartbeat response in X minutes).
 */
export async function cleanupStaleConnections(maxAgeMinutes: number = 15): Promise<void> {
  const now = new Date();
  const staleClients: string[] = [];

  for (const [clientId, connection] of activeConnections) {
    const ageMinutes = (now.getTime() - connection.lastHeartbeat.getTime()) / (1000 * 60);
    if (ageMinutes > maxAgeMinutes) {
      staleClients.push(clientId);
    }
  }

  for (const clientId of staleClients) {
    await unsubscribeClient(clientId);
  }

  if (staleClients.length > 0) {
    log.info({ staleCount: staleClients.length }, '[WS] Cleaned up stale connections');
  }
}
