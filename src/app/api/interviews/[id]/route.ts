import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateInterviewSchema } from '@/lib/validation/schemas';
import { getInterviewById, updateInterview, deleteInterview } from '@/lib/db/interviews';

/**
 * GET /api/interviews/[id]
 * Get a single interview
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

    const interview = await getInterviewById(user.id, params.id);
    if (!interview) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } }, { status: 404 });
    }

    return successResponse(interview);
  } catch (error) {
    console.error('GET /api/interviews/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * PATCH /api/interviews/[id]
 * Update an interview
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
    const validation = await validateRequest(req, updateInterviewSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const interview = await updateInterview(user.id, params.id, validation.data);
    if (!interview) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } }, { status: 404 });
    }

    return successResponse(interview);
  } catch (error) {
    console.error('PATCH /api/interviews/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/interviews/[id]
 * Delete an interview
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

    const interview = await deleteInterview(user.id, params.id);
    if (!interview) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } }, { status: 404 });
    }

    return successResponse({ success: true, interview });
  } catch (error) {
    console.error('DELETE /api/interviews/[id] error:', error);
    return errorResponse(error);
  }
}
