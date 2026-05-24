/**
 * Integration Layer: Phase 2 Executor → Redis Event System
 * Bridges new Phase 2 execution model with existing Redis pub/sub infrastructure
 */

import { redis } from '@/lib/redis/redisClient';
import {
  AgentStartedEvent,
  AgentCompletedEvent,
  AgentStatusEvent,
  AgentType as LegacyAgentType,
  REDIS_CHANNELS,
  AgentStatus,
} from '@/lib/realtime/events';
import { AgentType as Phase2AgentType } from './prompts';
import { publishAgentStatusSnapshot, publishRealtimeEvent } from '@/lib/queue/events';

/**
 * Map Phase 2 agent types to legacy agent types for Redis events
 */
function mapAgentType(phase2Type: Phase2AgentType): LegacyAgentType {
  const typeMap: Record<Phase2AgentType, LegacyAgentType> = {
    'resume-tailor': 'resume_tailor',
    'job-match': 'job_matching',
    'interview-prep': 'interview_prep',
    research: 'research',
    'follow-up': 'follow_up',
    networking: 'networking',
  };

  return typeMap[phase2Type] || ('research' as LegacyAgentType);
}

/**
 * Map execution status to legacy agent status
 */
function mapExecutionStatus(
  executionStatus: 'queued' | 'running' | 'completed' | 'failed' | 'paused'
): AgentStatus {
  switch (executionStatus) {
    case 'running':
      return 'running';
    case 'completed':
      return 'completed';
    case 'failed':
      return 'error';
    case 'paused':
      return 'waiting';
    case 'queued':
      return 'waiting';
    default:
      return 'idle';
  }
}

/**
 * Publish agent started event to Redis
 */
export async function publishAgentStarted(
  userId: string,
  executionId: string,
  agentType: Phase2AgentType,
  input: Record<string, any>
): Promise<void> {
  const event: AgentStartedEvent = {
    type: 'agent:started',
    userId,
    agentType: mapAgentType(agentType),
    executionId,
    input,
    timestamp: new Date(),
  };

  try {
    await publishRealtimeEvent(userId, {
      type: 'execution:started',
      executionId,
      userId,
      agentType,
      status: 'running',
      currentTask: `Starting ${agentType}`,
      timestamp: new Date().toISOString(),
    });

    await redis.publish(
      REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
      JSON.stringify(event)
    );
  } catch (error) {
    console.error('[Redis Integration] Failed to publish agent:started:', error);
  }
}

/**
 * Publish agent completed event to Redis
 */
export async function publishAgentCompleted(
  userId: string,
  executionId: string,
  agentType: Phase2AgentType,
  status: 'success' | 'failed',
  output: Record<string, any> | undefined,
  error: string | undefined,
  tokensUsed: number,
  durationMs: number
): Promise<void> {
  const event: AgentCompletedEvent = {
    type: 'agent:completed',
    userId,
    agentType: mapAgentType(agentType),
    executionId,
    status,
    output,
    error,
    tokensUsed,
    duration: durationMs,
    timestamp: new Date(),
  };

  try {
    await publishRealtimeEvent(userId, {
      type: status === 'success' ? 'execution:completed' : 'execution:failed',
      executionId,
      userId,
      agentType,
      status: status === 'success' ? 'completed' : 'failed',
      currentTask: status === 'success' ? 'Completed' : error,
      timestamp: new Date().toISOString(),
    });

    await redis.publish(
      REDIS_CHANNELS.AGENT_EXECUTIONS(userId),
      JSON.stringify(event)
    );
  } catch (error) {
    console.error('[Redis Integration] Failed to publish agent:completed:', error);
  }
}

/**
 * Publish agent status update to Redis
 */
export async function publishAgentStatus(
  userId: string,
  executionId: string,
  agentType: Phase2AgentType,
  executionStatus: 'queued' | 'running' | 'completed' | 'failed' | 'paused',
  queueDepth: number = 0,
  currentTask?: string,
  tokensUsed?: number,
  confidence?: number
): Promise<void> {
  const event: AgentStatusEvent = {
    type: 'agent:status_update',
    userId,
    agentType: mapAgentType(agentType),
    status: mapExecutionStatus(executionStatus),
    queueDepth,
    currentTask,
    lastActivity: new Date(),
    tokensUsed,
    confidence,
  };

  try {
    await publishRealtimeEvent(userId, {
      type: 'execution:status',
      executionId,
      userId,
      agentType,
      status: executionStatus,
      progress: executionStatus === 'completed' ? 100 : executionStatus === 'running' ? 50 : 0,
      currentTask,
      queueDepth,
      tokensUsed,
      confidence,
      timestamp: new Date().toISOString(),
    });

    await publishAgentStatusSnapshot(userId, mapAgentType(agentType), {
      status: mapExecutionStatus(executionStatus),
      queueDepth,
      currentTask,
      lastActivity: new Date(),
      tokensUsed,
      confidence,
    });

    await redis.publish(
      REDIS_CHANNELS.AGENT_STATUS(userId),
      JSON.stringify(event)
    );
  } catch (error) {
    console.error('[Redis Integration] Failed to publish agent:status:', error);
  }
}
