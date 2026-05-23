/**
 * GET /api/agents/executions
 * Paginated list of agent executions for the authenticated user.
 * Query params: status?, page (0-based), pageSize
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status') ?? undefined;
    const page = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));

    const where = {
      userId: email,
      ...(status ? { status: status as 'queued' | 'running' | 'completed' | 'failed' } : {}),
    };

    const [executions, total] = await Promise.all([
      prisma.agentExecution.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: page * pageSize,
        take: pageSize,
        select: {
          id: true,
          agentType: true,
          status: true,
          tokenCount: true,
          durationMs: true,
          errorMessage: true,
          createdAt: true,
          startedAt: true,
          completedAt: true,
        },
      }),
      prisma.agentExecution.count({ where }),
    ]);

    return NextResponse.json({
      executions: executions.map((e) => ({
        id: e.id,
        agentType: e.agentType,
        status: e.status,
        progress: e.status === 'completed' ? 100 : e.status === 'running' ? 50 : 0,
        tokenCount: e.tokenCount ?? undefined,
        durationMs: e.durationMs ?? undefined,
        errorMessage: e.errorMessage ?? undefined,
        createdAt: e.createdAt.toISOString(),
        startedAt: e.startedAt?.toISOString(),
        completedAt: e.completedAt?.toISOString(),
      })),
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('[executions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
