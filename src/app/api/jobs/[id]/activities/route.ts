/**
 * GET /api/jobs/[id]/activities
 * Fetch activity log for a specific job
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch activities from database
    // TODO: Implement activity queries based on your Prisma schema
    const activities = await prisma.eventLog.findMany({
      where: {
        executionId: { startsWith: id },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Transform to Activity format
    const transformedActivities = activities.map((log: any) => ({
      id: log.id,
      type: 'agent_action' as const,
      timestamp: log.createdAt.toISOString(),
      description: log.message,
      metadata: log.metadata,
    }));

    return NextResponse.json(transformedActivities);
  } catch (error) {
    console.error('[Activities API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch activities',
      },
      { status: 500 }
    );
  }
}
