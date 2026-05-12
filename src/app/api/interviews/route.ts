import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { scheduleInterviewSchema, listInterviewsQuerySchema } from '@/lib/validation/schemas';
import { getInterviews, scheduleInterview } from '@/lib/db/interviews';

/**
 * GET /api/interviews
 * List interviews for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryData = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      jobId: searchParams.get('jobId') || undefined,
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      sortBy: (searchParams.get('sortBy') || 'scheduledAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'asc') as any,
    };

    // Validate query
    const validation = listInterviewsQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return validationErrorResponse(new Error('Invalid query parameters'));
    }

    const result = await getInterviews(user.id, validation.data);
    return successResponse(result);
  } catch (error) {
    console.error('GET /api/interviews error:', error);
    return errorResponse(error);
  }
}

/**
 * POST /api/interviews
 * Schedule a new interview
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(req, scheduleInterviewSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const interview = await scheduleInterview(user.id, validation.data);
    if (!interview) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse(interview, 201);
  } catch (error) {
    console.error('POST /api/interviews error:', error);
    return errorResponse(error);
  }
}
