import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { prisma } from '@/lib/db';
import { redis } from '@/lib/redis/redisClient';

export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/search/status
 * Retrieves status and transient results of a queue-driven Indeed/LinkedIn job search task.
 */
export const GET = withAuth(
  async (request: NextRequest) => {
    try {
      const jobId = request.nextUrl.searchParams.get('jobId') || request.nextUrl.searchParams.get('executionId');
      if (!jobId) {
        return errorResponse(new Error('Missing jobId or executionId query parameter'), 400);
      }

      const execution = await prisma.agentExecution.findUnique({
        where: { id: jobId },
      });

      if (!execution) {
        return errorResponse(new Error('Job search execution not found'), 404);
      }

      if (execution.status === 'completed') {
        const redisKey = `scraping:search:results:${jobId}`;
        const rawResults = await redis.get(redisKey);

        if (!rawResults) {
          return successResponse({
            status: 'completed',
            expired: true,
            message: 'Search results have expired from cache. Please run search again.',
            jobs: [],
            count: 0,
          });
        }

        const results = JSON.parse(rawResults);
        return successResponse({
          status: 'completed',
          jobs: results,
          count: results.length,
        });
      }

      if (execution.status === 'failed') {
        return successResponse({
          status: 'failed',
          error: execution.errorMessage || 'Scraping worker process failed.',
        });
      }

      return successResponse({
        status: execution.status, // 'queued' | 'running'
        progress: execution.status === 'running' ? 50 : 0,
        message: 'Search is still being processed in the background...',
      });
    } catch (error) {
      return errorResponse(error);
    }
  },
  {
    classification: 'authenticated',
    rateLimitClass: 'standard',
    auditSensitivity: 'low',
  }
);
