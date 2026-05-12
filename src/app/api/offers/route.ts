import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/app/api/middleware/auth';
import { validateRequest, successResponse, validationErrorResponse, errorResponse } from '@/app/api/middleware/validation';
import { logOfferSchema, listOffersQuerySchema } from '@/lib/validation/schemas';
import { getOffers, logOffer } from '@/lib/db/offers';

/**
 * GET /api/offers
 * List offers for authenticated user
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
      status: searchParams.get('status') || undefined,
      sortBy: (searchParams.get('sortBy') || 'createdAt') as any,
      sortOrder: (searchParams.get('sortOrder') || 'desc') as any,
    };

    // Validate query
    const validation = listOffersQuerySchema.safeParse(queryData);
    if (!validation.success) {
      return validationErrorResponse(new Error('Invalid query parameters'));
    }

    const result = await getOffers(user.id, validation.data);
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
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Validate request body
    const validation = await validateRequest(req, logOfferSchema);
    if (!validation.valid) {
      return validationErrorResponse(validation.error);
    }

    const offer = await logOffer(user.id, validation.data);
    if (!offer) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Job not found' } }, { status: 404 });
    }

    return successResponse(offer, 201);
  } catch (error) {
    console.error('POST /api/offers error:', error);
    return errorResponse(error);
  }
}
