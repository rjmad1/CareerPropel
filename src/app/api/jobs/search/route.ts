import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { searchGreenhouse, normalizeGreenhouse } from '@/lib/scraping/greenhouse';
import { scrapingQueue } from '@/lib/scraping/scrapingQueue';
import { getCorrelationId } from '@/lib/logging/traceContext';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const SearchSchema = z.object({
  source: z.enum(['greenhouse', 'indeed', 'linkedin']),
  query: z.string().min(1),
  location: z.string().optional(),
  // Greenhouse-specific: board token (e.g. "stripe")
  boardToken: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * POST /api/jobs/search
 * Search a job board. If the board is Greenhouse, it executes synchronously.
 * If Indeed or LinkedIn, it enqueues the search job asynchronously in the scraping queue.
 */
export const POST = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json();
      const parsed = SearchSchema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(new Error('Invalid request: ' + parsed.error.issues[0]?.message), 400);
      }

      const { source, query, location, boardToken, limit } = parsed.data;
      const correlationId = getCorrelationId();

      if (source === 'greenhouse') {
        if (!boardToken) return errorResponse(new Error('boardToken is required for Greenhouse'), 400);
        const jobs = await searchGreenhouse(boardToken, query, limit);
        const results = jobs.map((j) => normalizeGreenhouse(j, boardToken));
        return successResponse({ jobs: results, count: results.length });
      }

      // Enqueue scraping worker task for Indeed or LinkedIn
      const executionId = await scrapingQueue.enqueueJobSearch(
        auth.userId,
        source,
        query,
        location,
        limit,
        correlationId
      );

      return successResponse(
        {
          message: 'Job search scraping enqueued successfully.',
          jobId: executionId,
          executionId,
          status: 'queued',
          source,
        },
        202
      );
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'medium',
  }
);
