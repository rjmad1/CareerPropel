import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { OfferStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

const NegotiateSchema = z.object({
  action: z.enum(['counter', 'accept', 'reject', 'info_request']),
  counterAmount: z.number().positive().optional(),
  notes: z.string().max(1000).optional(),
});

/**
 * POST /api/offers/[id]/negotiate
 * Record a negotiation action on an offer.
 * Stores history as ProfileData JSON keyed by offer ID.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    if (!userEmail) return errorResponse(new Error('Unauthorized'), 401);

    const body = await request.json();
    const validation = NegotiateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(new Error(validation.error.errors[0].message), 400);
    }

    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) return errorResponse(new Error('Candidate not found'), 404);

    const offer = await prisma.offer.findFirst({
      where: { id, job: { candidateId: candidate.id } },
      include: { job: true },
    });
    if (!offer) return errorResponse(new Error('Offer not found'), 404);

    const { action, counterAmount, notes } = validation.data;

    // Determine new offer status
    const statusMap: Record<string, OfferStatus> = {
      counter: 'negotiating',
      accept: 'accepted',
      reject: 'rejected',
      info_request: 'negotiating',
    };
    const newStatus = statusMap[action];

    // Update offer status
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { status: newStatus },
      include: { job: true },
    });

    // Store negotiation event in ProfileData for history tracking
    const historyKey = `negotiation_history_${id}`;
    const existing = await prisma.profileData.findFirst({
      where: { candidateId: candidate.id, type: historyKey },
    });

    const newEvent = {
      action,
      counterAmount: counterAmount ?? null,
      notes: notes ?? null,
      previousStatus: offer.status,
      newStatus,
      timestamp: new Date().toISOString(),
    };

    if (existing) {
      const history = Array.isArray(existing.content) ? existing.content : [];
      await prisma.profileData.update({
        where: { id: existing.id },
        data: { content: [...history, newEvent] },
      });
    } else {
      await prisma.profileData.create({
        data: {
          candidateId: candidate.id,
          type: historyKey,
          content: [newEvent],
        },
      });
    }

    return successResponse({ offer: updatedOffer, event: newEvent });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * GET /api/offers/[id]/negotiate
 * Return full negotiation history for an offer.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();
    if (!userEmail) return errorResponse(new Error('Unauthorized'), 401);

    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) return errorResponse(new Error('Candidate not found'), 404);

    const historyKey = `negotiation_history_${id}`;
    const record = await prisma.profileData.findFirst({
      where: { candidateId: candidate.id, type: historyKey },
    });

    return successResponse({
      offerId: id,
      history: Array.isArray(record?.content) ? record.content : [],
    });
  } catch (error) {
    return errorResponse(error);
  }
}
