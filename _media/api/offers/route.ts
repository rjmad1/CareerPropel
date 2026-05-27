import { NextRequest, NextResponse } from 'next/server';
import { ValidationError } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { logOfferSchema, listOffersQuerySchema } from '@/lib/validation/schemas';
import { getOffers, logOffer } from '@/lib/db/offers';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/offers
 * List offers for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Parse query parameters
    const searchParams = req.nextUrl.searchParams;
    const queryData = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      status: searchParams.get('status') || undefined,
      sortBy: (searchParams.get('sortBy') || 'createdAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as any,
    };

    // Validate query
    const validation = listOffersQuerySchema.safeParse(queryData);
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

    const result = await getOffers(candidate.id, validation.data);
    return successResponse(result);
  } catch (error) {
    console.error('GET /api/offers error:', error);
    return errorResponse(error);
  }
}

/**
 * POST /api/offers
 * Log a new offer
 */
export async function POST(req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Profile not found' } }, { status: 404 });
    }

    // Validate request body
    const validation = await validateRequest(req, logOfferSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const offer = await logOffer(candidate.id, validation.data);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse(offer, 201);
  } catch (error) {
    console.error('POST /api/offers error:', error);
    return errorResponse(error);
  }
}
