import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { searchGreenhouse, normalizeGreenhouse } from '@/lib/scraping/greenhouse';
import { searchLever, normalizeLever } from '@/lib/scraping/lever';
import { searchAshby, normalizeAshby } from '@/lib/scraping/ashby';
import { scrapingQueue } from '@/lib/scraping/scrapingQueue';
import { getCorrelationId } from '@/lib/logging/traceContext';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// CWE-22 / SSRF hardening: boardToken is interpolated directly into external API URLs
// (e.g. https://boards.greenhouse.io/v1/boards/{boardToken}/jobs).
// Restrict to lowercase alphanumeric + hyphens/underscores only — no path traversal,
// query-string injection, or protocol-relative prefixes are possible with this allowlist.
const BOARD_TOKEN_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/i;

const SearchSchema = z.object({
  source: z.enum(['greenhouse', 'indeed', 'linkedin', 'lever', 'ashby']),
  query: z.string().min(1).max(200),
  location: z.string().max(200).optional(),
  // Greenhouse/Lever/Ashby: board token / company handle (e.g. "stripe")
  boardToken: z
    .string()
    .regex(BOARD_TOKEN_RE, 'boardToken must be alphanumeric with optional hyphens/underscores')
    .optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * POST /api/jobs/search
 * Search a job board. If the board is Greenhouse, Lever, or Ashby, it executes synchronously.
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

      if (source === 'lever') {
        if (!boardToken) return errorResponse(new Error('boardToken is required for Lever'), 400);
        const jobs = await searchLever(boardToken, query, limit);
        const results = jobs.map((j) => normalizeLever(j, boardToken));
        return successResponse({ jobs: results, count: results.length });
      }

      if (source === 'ashby') {
        if (!boardToken) return errorResponse(new Error('boardToken is required for Ashby'), 400);
        const jobs = await searchAshby(boardToken, query, limit);
        const results = jobs.map((j) => normalizeAshby(j, boardToken));
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
