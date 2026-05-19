import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateInterviewSchema } from '@/lib/validation/schemas';
import { getInterviewById, updateInterview, deleteInterview } from '@/lib/db/interviews';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/interviews/[id]
 * Get a single interview
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const interview = await getInterviewById(candidate.id, params.id);
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
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Validate request body
    const validation = await validateRequest(req, updateInterviewSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const interview = await updateInterview(candidate.id, params.id, validation.data);
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
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const interview = await deleteInterview(candidate.id, params.id);
    if (!interview) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Interview not found' } }, { status: 404 });
    }

    return successResponse({ success: true, interview });
  } catch (error) {
    console.error('DELETE /api/interviews/[id] error:', error);
    return errorResponse(error);
  }
}
