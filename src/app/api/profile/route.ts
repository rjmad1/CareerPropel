import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateProfileSchema } from '@/lib/validation/schemas';
import { getProfile, updateProfile } from '@/lib/db/profile';

/**
 * GET /api/profile
 * Get user profile
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

    const profile = await getProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    return successResponse(profile);
  } catch (error) {
    console.error('GET /api/profile error:', error);
    return errorResponse(error);
  }
}

/**
 * PATCH /api/profile
 * Update user profile
 */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(req, updateProfileSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const profile = await updateProfile(user.id, validation.data);
    return successResponse(profile);
  } catch (error) {
    console.error('PATCH /api/profile error:', error);
    return errorResponse(error);
  }
}
