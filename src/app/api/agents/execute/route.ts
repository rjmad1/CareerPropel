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
import { AgentType } from '@/lib/agents/prompts';
import { getCurrentUser } from '@/app/api/middleware/auth';
import { appendExecutionLog } from '@/lib/agents/store';
import { createLogger } from '@/lib/logging/logger';
import { createRateLimiter } from '@/lib/middleware/rateLimiter';
import { publishRealtimeEvent } from '@/lib/queue/events';
import { sanitizeQueuePayload } from '@/lib/queue/payload';
import { enqueueExecution } from '@/lib/queue/queues';

const routeLogger = createLogger({ route: '/api/agents/execute' });
const executeRateLimiter = createRateLimiter(20, 60);

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await executeRateLimiter(request);
    if (rateLimited) {
      return rateLimited;
    }

    // Parse request body
    const body = await request.json();
    const { agentType, context, jobId } = body as {
      agentType: AgentType;
      context: Record<string, string | undefined>;
      jobId?: string;
    };

    // Validate input
    if (!agentType) {
      return NextResponse.json(
        { error: 'agentType is required' },
        { status: 400 }
      );
    }

    const validAgentTypes: AgentType[] = [
      'resume-tailor',
      'job-match',
      'interview-prep',
      'research',
      'follow-up',
      'networking',
    ];

    if (!validAgentTypes.includes(agentType)) {
      return NextResponse.json(
        { error: `Invalid agentType. Must be one of: ${validAgentTypes.join(', ')}` },
        { status: 400 }
      );
    }

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

    // Feature flag: route to BullMQ queue or legacy cron path
    const useQueue = process.env.QUEUE_EXECUTION_ENABLED === 'true';

    if (useQueue) {
      try {
        const job = await enqueueExecution({
          executionId: `pending-${Date.now()}`,
          agentType,
          userId,
          promptContext: (context || {}) as Record<string, string | undefined>,
          requestId: requestId || `req-${Date.now()}`,
          correlationId: correlationId || `corr-${Date.now()}`,
          submittedAt: new Date().toISOString(),
        });
        return NextResponse.json({
          executionId: job.id,
          status: 'queued',
          message: 'Agent execution queued for processing',
        }, { status: 202 });
      } catch (enqueueErr: unknown) {
        const e = enqueueErr as { code?: string; message?: string };
        if (e?.code === 'COST_CEILING_EXCEEDED') {
          return NextResponse.json({ error: e.message }, { status: 400 });
        }
        throw enqueueErr; // let outer catch handle unexpected errors
      }
    }

    // ── Legacy cron path ────────────────────────────────────────────────────
    const execution = await prisma.agentExecution.create({
      data: {
        userId,
        jobId,
        agentType,
        status: 'queued',
        input: JSON.stringify(sanitizedContext || {}),
        requestId,
        correlationId,
        metadata: {
          requestId,
          correlationId,
          executionModel: 'bullmq',
        },
      },
    });

    await appendExecutionLog(
      execution.id,
      userId,
      agentType,
      'INFO',
      `Agent execution queued: ${agentType}`,
      { agentType, userId, requestId, correlationId }
    );

    const job = await enqueueExecution({
      executionId: execution.id,
      userId,
      agentType,
      promptContext: sanitizedContext,
      requestId,
      correlationId,
      submittedAt: new Date().toISOString(),
      jobId,
    });

    await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        queueJobId: String(job.id),
      },
    });

    await publishRealtimeEvent(userId, {
      type: 'execution:queued',
      executionId: execution.id,
      userId,
      agentType,
      status: 'queued',
      currentTask: `Queued ${agentType}`,
      correlationId,
      requestId,
      queueJobId: String(job.id),
      timestamp: new Date().toISOString(),
    });

    routeLogger.info(
      {
        executionId: execution.id,
        queueJobId: job.id,
        userId,
        agentType,
        requestId,
        correlationId,
      },
      'Agent execution enqueued'
    );

    return NextResponse.json({
      executionId: execution.id,
      queueJobId: job.id,
      status: 'queued',
      message: 'Agent execution queued for processing',
    });
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
