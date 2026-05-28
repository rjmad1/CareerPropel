/**
 * GET /api/fit-engine/scores
 * Returns all fit scores for the current candidate's jobs.
 * Supports filtering by recommendation and pagination.
 *
 * GET /api/fit-engine/scores?jobId={id}
 * Returns the detailed score for a specific job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const recommendation = searchParams.get('recommendation');
    const includeSuppressed = searchParams.get('includeSuppressed') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const candidate = await prisma.candidate.findUnique({
      where: { email: session.user.email },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Single job score
    if (jobId) {
      const score = await prisma.fitScoringSnapshot.findFirst({
        where: { candidateId: candidate.id, jobId },
        include: {
          job: {
            select: { id: true, title: true, company: true, stage: true, url: true, createdAt: true },
          },
        },
      });

      if (!score) {
        return NextResponse.json({ error: 'Score not found for this job' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: score });
    }

    // All job scores (summary)
    const where: Record<string, unknown> = { candidateId: candidate.id };
    if (!includeSuppressed) {
      where.suppressed = false;
    }
    if (recommendation) {
      where.recommendation = recommendation;
    }

    const [scores, total] = await Promise.all([
      prisma.fitScoringSnapshot.findMany({
        where: where as Parameters<typeof prisma.fitScoringSnapshot.findMany>[0],
        orderBy: { fitScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          job: {
            select: { id: true, title: true, company: true, stage: true },
          },
        },
      }),
      prisma.fitScoringSnapshot.count({ where: where as Parameters<typeof prisma.fitScoringSnapshot.count>[0] }),
    ]);

    return NextResponse.json({
      success: true,
      data: scores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
