/**
 * Event types and schemas for real-time agent status updates
 * Published via Redis pub/sub, consumed by WebSocket clients
 */

export type AgentStatus = 'idle' | 'running' | 'waiting' | 'error' | 'completed';
export type AgentType = 
  | 'resume_tailor'
  | 'job_matching'
  | 'application'
  | 'research'
  | 'interview_prep'
  | 'networking'
  | 'follow_up'
  | 'analytics'
  | 'role_intelligence'
  | 'fit_analysis'
  | 'strength_mapper'
  | 'conversion_scorer'
  | 'gap_analyzer'
  | 'pattern_miner';

/**
 * Agent status update event
 * Published when agent state changes
 */
export interface AgentStatusEvent {
  type: 'agent:status_update';
  userId: string;
  agentType: AgentType;
  status: AgentStatus;
  queueDepth: number;
  currentTask?: string;
  lastActivity: Date;
  tokensUsed?: number;
  confidence?: number; // 0-1
}

/**
 * Tool execution event
 * Published when an agent tool executes
 */
export interface ToolExecutionEvent {
  type: 'tool:execution';
  userId: string;
  agentType: AgentType;
  executionId: string;
  toolName: string;
  status: 'pending' | 'success' | 'failed';
  duration: number; // milliseconds
  timestamp: Date;
}

/**
 * Agent execution started event
 * Published when agent begins work
 */
export interface AgentStartedEvent {
  type: 'agent:started';
  userId: string;
  agentType: AgentType;
  executionId: string;
  jobId?: string;
  input: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Agent execution completed event
 * Published when agent finishes (success or failure)
 */
export interface AgentCompletedEvent {
  type: 'agent:completed';
  userId: string;
  agentType: AgentType;
  executionId: string;
  jobId?: string;
  status: 'success' | 'failed';
  output?: Record<string, unknown>;
  error?: string;
  tokensUsed: number;
  duration: number; // milliseconds
  timestamp: Date;
}

/**
 * Queue stats event
 * Published periodically with queue depth and throughput
 */
export interface QueueStatsEvent {
  type: 'queue:stats';
  userId: string;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  avgProcessingTime: number; // milliseconds
  throughputPerMin: number;
  timestamp: Date;
}

/**
 * Error event
 * Published when something goes wrong
 */
export interface ErrorEvent {
  type: 'error';
  userId: string;
  message: string;
  code: string;
  timestamp: Date;
}

/**
 * Heartbeat event
 * Published periodically to keep connection alive
 */
export interface HeartbeatEvent {
  type: 'heartbeat';
  timestamp: Date;
}

/**
 * Union type of all possible events
 */
export type RealtimeEvent = 
  | AgentStatusEvent
  | ToolExecutionEvent
  | AgentStartedEvent
  | AgentCompletedEvent
  | QueueStatsEvent
  | ErrorEvent
  | HeartbeatEvent;

/**
 * Redis channel names
 */
export const REDIS_CHANNELS = {
  AGENT_STATUS: (userId: string) => `agent:status:${userId}`,
  AGENT_EXECUTIONS: (userId: string) => `agent:executions:${userId}`,
  QUEUE_STATS: (userId: string) => `queue:stats:${userId}`,
  GLOBAL_ERRORS: 'system:errors',
  HEARTBEAT: 'system:heartbeat',
} as const;

/**
 * Publish event to Redis pub/sub
 */
export async function publishEvent(
  redis: { publish(channel: string, message: string): Promise<unknown> },
  channel: string,
  event: RealtimeEvent
): Promise<void> {
  try {
    await redis.publish(channel, JSON.stringify(event));
  } catch (error) {
    console.error(`Failed to publish event to ${channel}:`, error);
  }
}

/**
 * Parse event from Redis message
 */
export function parseEvent(message: string): RealtimeEvent | null {
  try {
    const event = JSON.parse(message);
    // Validate event has required type field
    if (!event.type || !event.timestamp) {
      return null;
    }
    return event as RealtimeEvent;
  } catch {
    return null;
  }
}
