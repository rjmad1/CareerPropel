import { EventLog } from '@prisma/client';
import { redis } from '@/lib/redis/redisClient';
import { createLogger } from '@/lib/logging/logger';

const eventLogger = createLogger({ component: 'queue-events' });

export const realtimeChannels = {
  executionEvents: (userId: string) => `agent-events:${userId}`,
  agentStatus: (userId: string) => `agent-status:${userId}`,
} as const;

export type ExecutionRealtimeEvent =
  | {
      type: 'execution:queued' | 'execution:started' | 'execution:completed' | 'execution:failed';
      executionId: string;
      userId: string;
      agentType: string;
      status: 'queued' | 'running' | 'completed' | 'failed';
      currentTask?: string;
      correlationId?: string | null;
      requestId?: string | null;
      queueJobId?: string | null;
      timestamp: string;
    }
  | {
      type: 'execution:status';
      executionId: string;
      userId: string;
      agentType: string;
      status: 'queued' | 'running' | 'completed' | 'failed' | 'paused';
      progress: number;
      currentTask?: string;
      queueDepth?: number;
      tokensUsed?: number;
      confidence?: number;
      correlationId?: string | null;
      requestId?: string | null;
      timestamp: string;
    }
  | {
      type: 'log:new';
      executionId: string;
      userId: string;
      agentType: string;
      log: EventLog;
      timestamp: string;
    };

export async function publishRealtimeEvent(userId: string, event: ExecutionRealtimeEvent) {
  try {
    await redis.publish(realtimeChannels.executionEvents(userId), JSON.stringify(event));
  } catch (error) {
    eventLogger.error({ err: error, userId, eventType: event.type }, 'Failed to publish realtime event');
  }
}

export async function publishAgentStatusSnapshot(
  userId: string,
  agentType: string,
  payload: Record<string, unknown>
) {
  const key = `agent:status:${userId}:${agentType}`;

  try {
    await redis.set(key, JSON.stringify(payload), 'EX', 3600);
    await redis.publish(
      realtimeChannels.agentStatus(userId),
      JSON.stringify({
        type: 'agent:status_update',
        userId,
        agentType,
        ...payload,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    eventLogger.error({ err: error, userId, agentType }, 'Failed to publish agent status snapshot');
  }
}
