import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { updateOfferSchema } from '@/lib/validation/schemas';
import { getOfferById, updateOffer, deleteOffer } from '@/lib/db/offers';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/offers/[id]
 * Get a single offer
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const offer = await getOfferById(candidate.id, params.id);
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
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Validate request body
    const validation = await validateRequest(req, updateOfferSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const offer = await updateOffer(candidate.id, params.id, validation.data);
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
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    const offer = await deleteOffer(candidate.id, params.id);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Offer not found' } }, { status: 404 });
    }

    return successResponse({ success: true, offer });
  } catch (error) {
    console.error('DELETE /api/offers/[id] error:', error);
    return errorResponse(error);
  }
}
