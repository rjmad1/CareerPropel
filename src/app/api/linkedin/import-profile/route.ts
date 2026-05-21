import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { scrapingQueue } from '@/lib/scraping/scrapingQueue';
import { getCorrelationId } from '@/lib/logging/traceContext';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const Schema = z.object({
  profileUrl: z
    .string()
    .url()
    .refine((u) => u.includes('linkedin.com/in/'), {
      message: 'Must be a LinkedIn profile URL (linkedin.com/in/…)',
    }),
});

/**
 * POST /api/linkedin/import-profile
 * Enqueues a public LinkedIn profile scraping task in the asynchronous worker.
 */
export const POST = withAuth(
  async (request: NextRequest, auth) => {
    try {
      const body = await request.json();
      const parsed = Schema.safeParse(body);
      if (!parsed.success) {
        return errorResponse(new Error(parsed.error.issues[0]?.message ?? 'Invalid URL'), 400);
      }

      const { profileUrl } = parsed.data;
      const correlationId = getCorrelationId();

      // Enqueue job asynchronously in background worker
      const executionId = await scrapingQueue.enqueueProfileImport(
        auth.userId,
        profileUrl,
        correlationId
      );

      return successResponse(
        {
          message: 'LinkedIn profile import enqueued successfully.',
          jobId: executionId,
          executionId,
          status: 'queued',
        },
        202
      );
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'heavy', // 5 req/min
    auditSensitivity: 'high',
  }
);
