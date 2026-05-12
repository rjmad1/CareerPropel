import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, ValidationError } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { createJobSchema, listJobsQuerySchema } from '@/lib/validation/schemas';
import { getJobs, createJob } from '@/lib/db/jobs';

/**
 * GET /api/jobs
 * List jobs for authenticated user with filtering, sorting, pagination
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
      company: searchParams.get('company') || undefined,
      stage: searchParams.get('stage') || undefined,
      minSalary: searchParams.get('minSalary') ? parseInt(searchParams.get('minSalary')!) : undefined,
      maxSalary: searchParams.get('maxSalary') ? parseInt(searchParams.get('maxSalary')!) : undefined,
      minMatchScore: searchParams.get('minMatchScore')
        ? parseInt(searchParams.get('minMatchScore')!)
        : undefined,
      maxMatchScore: searchParams.get('maxMatchScore')
        ? parseInt(searchParams.get('maxMatchScore')!)
        : undefined,
      priority: searchParams.get('priority') || undefined,
      sortBy: (searchParams.get('sortBy') || 'updatedAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as any,
    };

    // Validate query
    const validation = listJobsQuerySchema.safeParse(queryData);
    if (!validation.success) {
      const details: Record<string, string[]> = {};
      validation.error.errors.forEach((error) => {
        const path = error.path.join('.');
        if (!details[path]) {
          details[path] = [];
        }
        details[path].push(error.message);
      });
      return validationErrorResponse(new ValidationError('Invalid query parameters', details));
    }

    const result = await getJobs(user.id, validation.data);
    return successResponse(result);
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return errorResponse(error);
  }
}

/**
 * POST /api/jobs
 * Create a new job
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
    const validation = await validateRequest(req, createJobSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const job = await createJob(user.id, validation.data);
    return successResponse(job, 201);
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return errorResponse(error);
  }
}
