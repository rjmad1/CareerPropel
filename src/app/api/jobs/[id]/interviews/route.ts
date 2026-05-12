/**
 * GET /api/jobs/[id]/interviews
 * Fetch interviews for a specific job
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch job and its interviews
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        interviews: {
          orderBy: { date: 'asc' },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job.interviews || []);
  } catch (error) {
    console.error('[Interviews API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch interviews',
      },
      { status: 500 }
    );
  }
}
