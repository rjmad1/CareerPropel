import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/agent/execution/[executionId]/logs
 * Fetch execution logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = params.executionId;
    const pageSize = parseInt(
      request.nextUrl.searchParams.get('pageSize') ||
        request.nextUrl.searchParams.get('limit') ||
        '50'
    );
    const page = parseInt(request.nextUrl.searchParams.get('page') || '0');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || String(page * pageSize));
    const level = request.nextUrl.searchParams.get('level');

    const logs = await prisma.eventLog.findMany({
      where: {
        executionId,
        ...(level ? { level } : {}),
      },
      orderBy: { timestamp: 'desc' },
      take: pageSize,
      skip: offset,
    });

    const total = await prisma.eventLog.count({
      where: {
        executionId,
        ...(level ? { level } : {}),
      },
    });

    return NextResponse.json(
      {
        logs,
        total,
        page,
        pageSize,
        hasMore: offset + logs.length < total,
        offset,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}
