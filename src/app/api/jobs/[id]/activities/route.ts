import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiErrors } from '@/lib/errors/ApiError';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { getAuthContext } from '@/lib/middleware/auth';
import { applyCorsHeaders, handleCorsPreFlight } from '@/lib/middleware/cors';
import { createRateLimiter } from '@/lib/middleware/rateLimiter';

export const dynamic = 'force-dynamic';

const limiter = createRateLimiter(100, 60000);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const corsResponse = handleCorsPreFlight(request);
    if (corsResponse) return corsResponse;

    const rateLimitResponse = await limiter(request);
    if (rateLimitResponse) return applyCorsHeaders(request, rateLimitResponse);

    const { userEmail } = await getAuthContext();
    const { id } = await context.params;

    if (!id || id.length < 5) {
      throw ApiErrors.INVALID_REQUEST('Invalid job ID format');
    }

    const job = await prisma.job.findUnique({
      where: { id },
      include: { candidate: true },
    });

    if (!job) throw ApiErrors.NOT_FOUND('job');
    if (job.candidate.email !== userEmail) throw ApiErrors.FORBIDDEN('job');

    const activities = await prisma.jobActivity.findMany({
      where: { jobId: id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const response = successResponse(activities);
    return applyCorsHeaders(request, response);
  } catch (error) {
    const response = errorResponse(error);
    return applyCorsHeaders(request, response);
  }
}
