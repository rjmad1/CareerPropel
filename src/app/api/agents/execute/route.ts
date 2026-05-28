/**
 * POST /api/agents/execute
 * Triggers a new agent execution
 *
 * Request body:
 * {
 *   agentType: 'resume-tailor' | 'job-match' | 'interview-prep' | 'research' | 'follow-up' | 'networking'
 *   context: {
 *     resume?: string
 *     jobDescription?: string
 *     companyName?: string
 *     companyInfo?: string
 *     userProfile?: string
 *     previousInterviews?: string
 *   }
 * }
 *
 * Response:
 * {
 *   executionId: string
 *   status: 'queued'
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/app/api/middleware/auth';
import { createLogger } from '@/lib/logging/logger';
import { createRateLimiter } from '@/lib/middleware/rateLimiter';
import { sanitizeQueuePayload } from '@/lib/queue/payload';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';

import { agentExecuteRequestSchema } from '@/contracts/api/execute';

const routeLogger = createLogger({ route: '/api/agents/execute' });
const executeRateLimiter = createRateLimiter(20, 60);

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await executeRateLimiter(request);
    if (rateLimited) {
      return rateLimited;
    }

    // Parse and validate request body via centralized Zod contract
    const body = await request.json();
    const parsed = agentExecuteRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid request body' },
        { status: 400 }
      );
    }
    const { agentType, context, jobId } = parsed.data;

    const currentUser = await getCurrentUser(request);
    const userId =
      currentUser?.id ||
      request.headers.get('x-user-id') ||
      request.headers.get('x-candidate-id') ||
      'local-development-user';
    const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
    const correlationId = request.headers.get('x-correlation-id') || crypto.randomUUID();
    const sanitizedContext = sanitizeQueuePayload((context || {}) as Record<string, unknown>) as Record<
      string,
      string | undefined
    >;

    try {
      const executionId = await enqueueAgentExecution(
        agentType,
        userId,
        { ...sanitizedContext, jobId, requestId, correlationId },
        request.headers.get('x-idempotency-key') || undefined
      );

      // Fetch the enqueued execution to retrieve its queueJobId
      const execution = await prisma.agentExecution.findUnique({
        where: { id: executionId },
        select: { queueJobId: true },
      });

      routeLogger.info(
        {
          executionId,
          queueJobId: execution?.queueJobId || null,
          userId,
          agentType,
          requestId,
          correlationId,
        },
        'Agent execution successfully routed and enqueued'
      );

      return NextResponse.json({
        executionId,
        queueJobId: execution?.queueJobId || null,
        status: 'queued',
        message: 'Agent execution queued for processing',
      }, { status: 202 });
    } catch (enqueueErr: unknown) {
      const e = enqueueErr as { code?: string; message?: string };
      if (e?.code === 'COST_CEILING_EXCEEDED') {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
      if (e?.code === 'ADMISSION_REJECTED') {
        return NextResponse.json({ error: e.message }, { status: 429 });
      }
      throw enqueueErr;
    }
  } catch (error) {
    routeLogger.error({ err: error }, 'Failed to enqueue agent execution');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/agents/execute/:executionId
 * Fetch execution status and results
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const callerEmail = session.user.email;

    const executionId = request.nextUrl.searchParams.get('executionId');

    if (!executionId) {
      return NextResponse.json(
        { error: 'executionId query parameter is required' },
        { status: 400 }
      );
    }

    const execution = await prisma.agentExecution.findUnique({
      where: { id: executionId },
      include: {
        eventLogs: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
      },
    });

    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    if (execution.userId !== callerEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      id: execution.id,
      userId: execution.userId,
      agentType: execution.agentType,
      status: execution.status,
      progress: execution.status === 'running' ? 50 : execution.status === 'completed' ? 100 : 0,
      output: execution.output ? JSON.parse(execution.output) : null,
      tokenCount: execution.tokenCount,
      durationMs: execution.durationMs,
      errorMessage: execution.errorMessage,
      createdAt: execution.createdAt,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      recentLogs: execution.eventLogs.map((log) => ({
        level: log.level,
        message: log.message,
        timestamp: log.timestamp,
      })),
    });
  } catch (error) {
    routeLogger.error({ err: error }, 'Failed to fetch agent execution');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
