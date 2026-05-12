import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, ForbiddenError } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateJobSchema } from '@/lib/validation/schemas';
import { getJobById, updateJob, deleteJob } from '@/lib/db/jobs';

/**
 * GET /api/jobs/[id]
 * Get a single job with all related data
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const job = await getJobById(user.id, params.id);
    if (!job) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse(job);
  } catch (error) {
    console.error('GET /api/jobs/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * PATCH /api/jobs/[id]
 * Update a job
 */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(req, updateJobSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const job = await updateJob(user.id, params.id, validation.data);
    if (!job) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse(job);
  } catch (error) {
    console.error('PATCH /api/jobs/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/jobs/[id]
 * Delete (archive) a job
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const job = await deleteJob(user.id, params.id);
    if (!job) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse({ success: true, job });
  } catch (error) {
    console.error('DELETE /api/jobs/[id] error:', error);
    return errorResponse(error);
  }
}
