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
import { prisma } from '@/lib/db';
import { AgentType } from '@/lib/agents/prompts';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { agentType, context } = body as {
      agentType: AgentType;
      context: Record<string, string | undefined>;
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

    // Get userId from session/auth
    // TODO: Replace with actual authentication
    const userId = 'user-' + Math.random().toString(36).substring(7);

    // Create execution record
    const execution = await prisma.agentExecution.create({
      data: {
        userId,
        agentType,
        status: 'queued',
        input: JSON.stringify(context || {}),
      },
    });

    // Log execution created
    await prisma.eventLog.create({
      data: {
        executionId: execution.id,
        level: 'INFO',
        message: `Agent execution queued: ${agentType}`,
        metadata: { agentType, userId },
      },
    });

    return NextResponse.json({
      executionId: execution.id,
      status: 'queued',
      message: `Agent execution queued for processing`,
    });
  } catch (error) {
    console.error('[Agent Execute] Error:', error);
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
      recentLogs: execution.eventLogs.map((log: any) => ({
        level: log.level,
        message: log.message,
        timestamp: log.timestamp,
      })),
    });
  } catch (error) {
    console.error('[Agent GET] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
