/**
 * Agent Status Broadcaster
 * Service for agents to publish their status updates to Redis pub/sub
 * Which are then streamed to connected WebSocket clients
 */

import { redis } from '@/lib/redis/redisClient';
import {
  publishEvent,
  REDIS_CHANNELS,
  AgentStatusEvent,
  AgentStartedEvent,
  AgentCompletedEvent,
  ToolExecutionEvent,
  AgentType,
  AgentStatus,
} from './events';

/**
 * Broadcast that an agent has started execution
 */
export async function broadcastAgentStarted(
  userId: string,
  agentType: AgentType,
  executionId: string,
  jobId: string | undefined,
  input: Record<string, unknown>
): Promise<void> {
  const event: AgentStartedEvent = {
    type: 'agent:started',
    userId,
    agentType,
    executionId,
    jobId,
    input,
    timestamp: new Date(),
  };

  await publishEvent(
    redis,
    REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
    event
  );

  console.log(`[Broadcast] Agent ${agentType} started for user ${userId}`);
}

/**
 * Broadcast that an agent has completed
 */
export async function broadcastAgentCompleted(
  userId: string,
  agentType: AgentType,
  executionId: string,
  jobId: string | undefined,
  status: 'success' | 'failed',
  output: Record<string, unknown> | undefined,
  error: string | undefined,
  tokensUsed: number,
  duration: number
): Promise<void> {
  const event: AgentCompletedEvent = {
    type: 'agent:completed',
    userId,
    agentType,
    executionId,
    jobId,
    status,
    output,
    error,
    tokensUsed,
    duration,
    timestamp: new Date(),
  };

  await publishEvent(
    redis,
    REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
    event
  );

  // Also update the agent status cache
  await updateAgentStatus(userId, agentType, status === 'success' ? 'completed' : 'error', 0);

  console.log(`[Broadcast] Agent ${agentType} ${status} for user ${userId}`);
}

/**
 * Broadcast a tool execution event
 */
export async function broadcastToolExecution(
  userId: string,
  agentType: AgentType,
  executionId: string,
  toolName: string,
  status: 'pending' | 'success' | 'failed',
  duration: number
): Promise<void> {
  const event: ToolExecutionEvent = {
    type: 'tool:execution',
    userId,
    agentType,
    executionId,
    toolName,
    status,
    duration,
    timestamp: new Date(),
  };

  await publishEvent(
    redis,
    REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
    event
  );
}

/**
 * Update agent status in cache and broadcast
 */
export async function updateAgentStatus(
  userId: string,
  agentType: AgentType,
  status: AgentStatus,
  queueDepth: number,
  currentTask?: string,
  tokensUsed?: number,
  confidence?: number
): Promise<void> {
  const event: AgentStatusEvent = {
    type: 'agent:status_update',
    userId,
    agentType,
    status,
    queueDepth,
    currentTask,
    lastActivity: new Date(),
    tokensUsed,
    confidence,
  };

  // Publish to real-time channel
  await publishEvent(
    redis,
    REDIS_CHANNELS.AGENT_STATUS(userId),
    event
  );

  // Also cache the latest status for quick retrieval
  const cacheKey = `agent:status:${userId}:${agentType}`;
  await redis.setex(
    cacheKey,
    3600, // 1 hour TTL
    JSON.stringify(event)
  );

  console.log(`[Broadcast] Agent ${agentType} status: ${status} for user ${userId}`);
}

/**
 * Set agent to running with optional queue depth
 */
export async function setAgentRunning(
  userId: string,
  agentType: AgentType,
  queueDepth: number = 0,
  currentTask?: string
): Promise<void> {
  await updateAgentStatus(userId, agentType, 'running', queueDepth, currentTask);
}

/**
 * Set agent to idle
 */
export async function setAgentIdle(
  userId: string,
  agentType: AgentType,
  queueDepth: number = 0
): Promise<void> {
  await updateAgentStatus(userId, agentType, 'idle', queueDepth);
}

/**
 * Set agent to error state
 */
export async function setAgentError(
  userId: string,
  agentType: AgentType,
  queueDepth: number = 0
): Promise<void> {
  await updateAgentStatus(userId, agentType, 'error', queueDepth);
}

/**
 * Broadcast queue statistics
 */
export async function broadcastQueueStats(
  userId: string,
  pending: number,
  running: number,
  completed: number,
  failed: number,
  avgProcessingTime: number,
  throughputPerMin: number
): Promise<void> {
  const event: import('./events').QueueStatsEvent = {
    type: 'queue:stats',
    userId,
    pending,
    running,
    completed,
    failed,
    avgProcessingTime,
    throughputPerMin,
    timestamp: new Date(),
  };

  await publishEvent(
    redis,
    REDIS_CHANNELS.QUEUE_STATS(userId),
    event
  );

  console.log(`[Broadcast] Queue stats for user ${userId}: ${pending} pending, ${running} running`);
}
