/**
 * GET /api/ops/executions
 * Execution trace inspection endpoint.
 *
 * Query params:
 *  - status       : filter by execution status
 *  - agentType    : filter by agent type
 *  - correlationId: find by correlation ID
 *  - failureType  : filter by classified failure type in event logs
 *  - limit        : max results (default 50, max 200)
 *  - offset       : pagination offset
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const params  = req.nextUrl.searchParams;
  const status        = params.get('status')       ?? undefined;
  const agentType     = params.get('agentType')    ?? undefined;
  const correlationId = params.get('correlationId') ?? undefined;
  const failureType   = params.get('failureType')  ?? undefined;
  const limit  = Math.min(200, parseInt(params.get('limit')  ?? '50', 10));
  const offset =              parseInt(params.get('offset') ?? '0',   10);

  const where: Record<string, unknown> = {};
  if (status)        where.status        = status;
  if (agentType)     where.agentType     = agentType;
  if (correlationId) where.correlationId = correlationId;

  // Failure type filter: look in event log metadata
  const failureLogFilter = failureType
    ? {
        eventLogs: {
          some: {
            level:    'ERROR',
            metadata: { path: ['failureType'], equals: failureType },
          },
        },
      }
    : {};

  const [total, executions] = await Promise.all([
    prisma.agentExecution.count({ where: { ...where, ...failureLogFilter } }),
    prisma.agentExecution.findMany({
      where: { ...where, ...failureLogFilter },
      orderBy: { createdAt: 'desc' },
      skip:  offset,
      take:  limit,
      include: {
        eventLogs: {
          orderBy: { timestamp: 'asc' },
          take: 20,
        },
        toolCalls: {
          orderBy: { startedAt: 'asc' },
        },
      },
    }),
  ]);

  const items = executions.map((ex) => ({
    executionId:   ex.id,
    userId:        ex.userId,
    agentType:     ex.agentType,
    status:        ex.status,
    correlationId: ex.correlationId,
    requestId:     ex.requestId,
    queueJobId:    ex.queueJobId,
    providerId:    ex.providerId,
    tokenCount:    ex.tokenCount,
    durationMs:    ex.durationMs,
    attempts:      ex.attempts,
    errorMessage:  ex.errorMessage,
    createdAt:     ex.createdAt,
    startedAt:     ex.startedAt,
    completedAt:   ex.completedAt,
    // Structured failure from last ERROR log
    failure: (() => {
      const errLog = ex.eventLogs.filter((l) => l.level === 'ERROR').pop();
      if (!errLog?.metadata) return null;
      const meta = errLog.metadata as Record<string, unknown>;
      return {
        failureType: meta.failureType,
        retryable:   meta.retryable,
        errorClass:  meta.errorClass,
      };
    })(),
    recentLogs: ex.eventLogs.slice(-10).map((l) => ({
      level:     l.level,
      message:   l.message,
      timestamp: l.timestamp,
      metadata:  l.metadata,
    })),
    toolCalls: ex.toolCalls.map((t) => ({
      toolName:   t.toolName,
      status:     t.status,
      durationMs: t.durationMs,
      tokens:     t.tokens,
    })),
  }));

  return NextResponse.json({
    total,
    limit,
    offset,
    items,
  });
}
