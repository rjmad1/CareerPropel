import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { scoreJobMatch } from '@/lib/jobs/matchScorer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/:id/match
 * Return the stored match score for a job.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id } = await context.params;

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return errorResponse(new Error('Candidate not found'), 404);
    }

    const job = await prisma.job.findFirst({
      where: { id, candidateId: candidate.id },
      select: { id: true, matchScore: true },
    });

    if (!job) {
      return errorResponse(new Error('Job not found'), 404);
    }

    return successResponse({ score: job.matchScore ?? 0 });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/jobs/:id/match
 * Run AI match scoring against the candidate's profile.
 * Persists the score and returns the full analysis.
 */
import { trackFunnelEvent } from '@/lib/observability/funnel';

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userEmail } = await getAuthContext();
    const { id } = await context.params;

    await trackFunnelEvent(userEmail, 'job', 'match', 'started');

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return errorResponse(new Error('Candidate not found'), 404);
    }

    const job = await prisma.job.findFirst({
      where: { id, candidateId: candidate.id },
      select: { id: true },
    });

    if (!job) {
      return errorResponse(new Error('Job not found'), 404);
    }

    const analysis = await scoreJobMatch(id, candidate.id);

    await trackFunnelEvent(userEmail, 'job', 'match', 'completed', { score: analysis.score });

    return successResponse(analysis);
  } catch (error) {
    try {
      const { userEmail } = await getAuthContext();
      if (userEmail) {
        await trackFunnelEvent(userEmail, 'job', 'match', 'failed', { error: error instanceof Error ? error.message : String(error) });
      }
    } catch {}
    return errorResponse(error);
  }
}
