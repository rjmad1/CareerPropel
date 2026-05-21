import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/agent/execution/[executionId]/logs
 * Fetch execution logs
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ executionId: string }> }
) {
  try {
    const { executionId } = await context.params;
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0');

    const logs = await prisma.eventLog.findMany({
      where: { executionId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.eventLog.count({
      where: { executionId },
    });

    return NextResponse.json(
      {
        logs,
        total,
        limit,
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
