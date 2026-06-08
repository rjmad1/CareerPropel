import { EventLog } from '@prisma/client';
import { prisma } from '@/lib/db';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { redis } from '@/lib/redis/redisClient';

/**
 * Summarizes the oldest 20 logs for an execution in the background to prevent token bloat.
 */
async function summarizeLogsInBackground(
  executionId: string
): Promise<void> {
  const lockKey = `lock:summary:${executionId}`;
  
  // Try to acquire Redis lock for 60 seconds
  const acquired = await redis.set(lockKey, 'true', 'EX', 60, 'NX');
  if (!acquired) {
    return; // Already summarizing or locked
  }

  try {
    // Check count under the lock
    const count = await prisma.eventLog.count({
      where: { executionId }
    });

    if (count < 20) {
      return;
    }

    // Fetch the oldest 20 logs
    const logs = await prisma.eventLog.findMany({
      where: { executionId },
      orderBy: { timestamp: 'asc' },
      take: 20
    });

    if (logs.length < 20) {
      return;
    }

    const logText = logs
      .map((l) => `[${l.timestamp.toISOString()}] [${l.level}] ${l.message}`)
      .join('\n');

    const summaryPrompt = `Summarize the following agent execution event logs into a single concise summary log. Do not exceed 2-3 sentences. Keep it highly informative and output only the summarized text:\n\n${logText}`;

    const { callLLM } = await import('@/lib/llm/provider');
    const result = await callLLM(
      [{ role: 'user', content: summaryPrompt }],
      {
        systemPrompt: 'You are an AI assistant that summarizes agent logs.',
        temperature: 0.3,
        maxTokens: 500,
      }
    );

    const summaryText = result.content.trim();

    // Perform database prune atomically
    await prisma.$transaction([
      prisma.eventLog.deleteMany({
        where: {
          id: { in: logs.map((l) => l.id) }
        }
      }),
      prisma.eventLog.create({
        data: {
          executionId,
          level: 'INFO',
          message: `[Rolling Summary] ${summaryText}`,
          metadata: {
            summarizedCount: logs.length,
            originalTimestamp: logs[0].timestamp,
          }
        }
      })
    ]);
  } catch (err) {
    console.error('[Rolling Summary Error]', err);
  } finally {
    // Release Redis lock
    await redis.del(lockKey);
  }
}

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
      metadata: metadata as unknown as import('@prisma/client').Prisma.InputJsonValue,
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

  // Trigger background rolling summarization if log count reaches 20 threshold
  prisma.eventLog.count({ where: { executionId } }).then((count) => {
    if (count >= 20) {
      summarizeLogsInBackground(executionId).catch((err) => {
        console.error('[Rolling Summary Background Trigger Error]', err);
      });
    }
  }).catch((err) => {
    console.error('[Rolling Summary Count Error]', err);
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
