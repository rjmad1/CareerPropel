/**
 * GET /api/jobs
 * Fetch list of jobs for the current user
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual user authentication
    const userId = 'default-user';

    const jobs = await prisma.job.findMany({
      where: { userId },
      include: {
        interviews: true,
      },
      orderBy: { applicationDate: 'desc' },
    });

    return NextResponse.json({
      jobs,
      total: jobs.length,
      hasMore: false,
    });
  } catch (error) {
    console.error('[Jobs List API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}
