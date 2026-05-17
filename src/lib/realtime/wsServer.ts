/**
 * WebSocket server connection manager
 * Handles client connections, Redis subscriptions, and message broadcasting
 */

import { redis } from '@/lib/redis/redisClient';
import { REDIS_CHANNELS, RealtimeEvent, parseEvent, AgentType } from './events';

interface ClientConnection {
  id: string;
  userId: string;
  socket: any; // WebSocket
  subscriptions: Set<string>;
  lastHeartbeat: Date;
}

/**
 * In-memory store of active WebSocket connections
 * Maps client IDs to their connection info
 */
const activeConnections = new Map<string, ClientConnection>();

/**
 * Subscribe a client to agent updates for a specific user
 */
export async function subscribeToAgentUpdates(
  clientId: string,
  userId: string,
  socket: any
): Promise<void> {
  // Create or update client connection
  const connection: ClientConnection = {
    id: clientId,
    userId,
    socket,
    subscriptions: new Set(),
    lastHeartbeat: new Date(),
  };

  activeConnections.set(clientId, connection);

  // Subscribe to Redis channels for this user
  const channels = [
    REDIS_CHANNELS.AGENT_STATUS(userId),
    REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
    REDIS_CHANNELS.QUEUE_STATS(userId),
  ];

  try {
    const redisSubscriber = redis.duplicate();
    
    redisSubscriber.on('message', (_channel: string, message: string) => {
      // Only send to the correct user's connections
      const event = parseEvent(message);
      if (event) {
        broadcastToUser(userId, event);
      }
    });

    await redisSubscriber.subscribe(...channels);
    
    // Store subscriber reference for cleanup
    connection.subscriptions = new Set(channels);
    
    console.log(`[WS] Client ${clientId} subscribed to ${channels.length} channels for user ${userId}`);
  } catch (error) {
    console.error(`[WS] Failed to subscribe client ${clientId}:`, error);
    throw error;
  }
}

/**
 * Unsubscribe a client and clean up its connection
 */
export async function unsubscribeClient(clientId: string): Promise<void> {
  const connection = activeConnections.get(clientId);
  if (!connection) return;

  try {
    // Close subscriptions
    for (const channel of connection.subscriptions) {
      await redis.unsubscribe(channel);
    }
    
    // Remove from active connections
    activeConnections.delete(clientId);
    
    console.log(`[WS] Client ${clientId} disconnected`);
  } catch (error) {
    console.error(`[WS] Error unsubscribing client ${clientId}:`, error);
  }
}

/**
 * Broadcast event to all connected clients for a specific user
 */
export function broadcastToUser(userId: string, event: RealtimeEvent): void {
  let sentCount = 0;
  
  for (const [clientId, connection] of activeConnections) {
    if (connection.userId === userId) {
      try {
        connection.socket.send(JSON.stringify(event));
        sentCount++;
      } catch (error) {
        console.error(`[WS] Failed to send to client ${clientId}:`, error);
        // Client connection is dead, will be cleaned up on disconnect
      }
    }
  }

  if (sentCount > 0) {
    console.log(`[WS] Broadcast to ${sentCount} clients for user ${userId}`);
  }
}

/**
 * Get current agent status for a user
 * Returns the last known status from Redis
 */
export async function getAgentStatus(userId: string, agentType: AgentType): Promise<any | null> {
  try {
    const key = `agent:status:${userId}:${agentType}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[WS] Error fetching agent status:`, error);
    return null;
  }
}

/**
 * Get all agents' current status for a user
 */
export async function getAllAgentStatus(userId: string): Promise<Record<string, any>> {
  try {
    const pattern = `agent:status:${userId}:*`;
    const keys = await redis.keys(pattern);
    
    const statusMap: Record<string, any> = {};
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const agentType = key.split(':')[3];
        statusMap[agentType] = JSON.parse(data);
      }
    }
    
    return statusMap;
  } catch (error) {
    console.error(`[WS] Error fetching all agent status:`, error);
    return {};
  }
}

/**
 * Get active connections count (for monitoring)
 */
export function getActiveConnectionCount(): number {
  return activeConnections.size;
}

/**
 * Get active connections for a specific user (for monitoring)
 */
export function getUserConnectionCount(userId: string): number {
  let count = 0;
  for (const connection of activeConnections.values()) {
    if (connection.userId === userId) count++;
  }
  return count;
}

/**
 * Heartbeat to keep connections alive
 * Send periodic pings to all connected clients
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
    } catch (error) {
      // Client connection is dead, will be cleaned up on disconnect
    }
  }

  if (sentCount > 0) {
    console.log(`[WS] Sent heartbeats to ${sentCount} clients`);
  }
}

/**
 * Clean up stale connections (no heartbeat response in X minutes)
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
    console.log(`[WS] Cleaned up ${staleClients.length} stale connections`);
  }
}
