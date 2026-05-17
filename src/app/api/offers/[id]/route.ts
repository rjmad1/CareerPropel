import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateOfferSchema } from '@/lib/validation/schemas';
import { getOfferById, updateOffer, deleteOffer } from '@/lib/db/offers';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/offers/[id]
 * Get a single offer
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

    const offer = await getOfferById(user.id, params.id);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } }, { status: 404 });
    }

    return successResponse(offer);
  } catch (error) {
    console.error('GET /api/offers/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * PATCH /api/offers/[id]
 * Update an offer
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
    const validation = await validateRequest(req, updateOfferSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const offer = await updateOffer(user.id, params.id, validation.data);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } }, { status: 404 });
    }

    return successResponse(offer);
  } catch (error) {
    console.error('PATCH /api/offers/[id] error:', error);
    return errorResponse(error);
  }
}

/**
 * DELETE /api/offers/[id]
 * Delete an offer
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

    const offer = await deleteOffer(user.id, params.id);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } }, { status: 404 });
    }

    return successResponse({ success: true, offer });
  } catch (error) {
    console.error('DELETE /api/offers/[id] error:', error);
    return errorResponse(error);
  }
}
