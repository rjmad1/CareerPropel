import { EventLog } from '@prisma/client';
import { prisma } from '@/lib/db';
import { publishRealtimeEvent } from '@/lib/queue/events';

export async function appendExecutionLog(
  executionId: string,
  userId: string,
  agentType: string,
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
  message: string,
  metadata?: Record<string, unknown>
): Promise<EventLog> {
  const log = await prisma.eventLog.create({
    data: {
      executionId,
      level,
      message,
      metadata: metadata as any,
    },
  });

  await publishRealtimeEvent(userId, {
    type: 'log:new',
    executionId,
    userId,
    agentType,
    log,
    timestamp: new Date().toISOString(),
  });

  return log;
}

export async function getExecutionEnvelope(executionId: string) {
  const execution = await prisma.agentExecution.findUnique({
    where: { id: executionId },
    include: {
      toolCalls: true,
      eventLogs: {
        orderBy: {
          timestamp: 'desc',
        },
      },
    },
  });

  return execution;
}
