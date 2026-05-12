/**
 * WebSocket Event Broadcasting
 * Sends real-time agent status and log events to connected clients
 */

// In-memory store of active WebSocket connections per user
// Maps userId -> Set<WebSocket connections>
const userConnections = new Map<string, Set<WebSocket>>();

export interface AgentStatusEvent {
  type: 'agent:status';
  data: {
    id: string;
    status: 'running' | 'completed' | 'failed' | 'paused';
    progress: number;
    currentTask: string;
    errorMessage?: string;
  };
}

export interface AgentLogEvent {
  type: 'agent:log';
  data: {
    executionId: string;
    level: 'INFO' | 'WARN' | 'ERROR';
    message: string;
    metadata?: Record<string, any>;
    timestamp: string;
  };
}

export type BroadcastEvent = AgentStatusEvent | AgentLogEvent;

/**
 * Register a WebSocket connection for a user
 */
export function registerUserConnection(userId: string, ws: WebSocket): void {
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId)!.add(ws);
}

/**
 * Unregister a WebSocket connection
 */
export function unregisterUserConnection(userId: string, ws: WebSocket): void {
  const connections = userConnections.get(userId);
  if (connections) {
    connections.delete(ws);
    if (connections.size === 0) {
      userConnections.delete(userId);
    }
  }
}

/**
 * Broadcast event to all connected clients for a user
 */
export function broadcastAgentEvent(userId: string, event: BroadcastEvent): void {
  const connections = userConnections.get(userId);
  if (!connections || connections.size === 0) {
    return;
  }

  const message = JSON.stringify(event);
  const deadConnections: WebSocket[] = [];

  for (const ws of connections) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      } else {
        // Mark for cleanup
        deadConnections.push(ws);
      }
    } catch (error) {
      console.error('[Broadcast] Failed to send event:', error);
      deadConnections.push(ws);
    }
  }

  // Cleanup dead connections
  for (const ws of deadConnections) {
    unregisterUserConnection(userId, ws);
  }
}

/**
 * Get active connection count for a user (for monitoring)
 */
export function getActiveConnectionCount(userId: string): number {
  return userConnections.get(userId)?.size || 0;
}

/**
 * Get total active connections across all users
 */
export function getTotalActiveConnections(): number {
  let total = 0;
  for (const connections of userConnections.values()) {
    total += connections.size;
  }
  return total;
}
