import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { generateNegotiationScript } from '@/lib/document/generator';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const NegotiationScriptSchema = z.object({
  targetSalary: z.number().positive(),
  keyAchievements: z.array(z.string()).optional(),
  competingOffer: z.number().positive().optional(),
});

/**
 * POST /api/offers/[id]/script
 * Generate an AI negotiation script (email + talking points) for an offer.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) return errorResponse(new Error('Unauthorized'), 401);

    const body = await request.json();
    const validation = NegotiationScriptSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(new Error(validation.error.errors[0].message), 400);
    }

    // Fetch the offer with job details, verify ownership
    const candidate = await prisma.candidate.findUnique({ where: { email: userEmail } });
    if (!candidate) return errorResponse(new Error('Candidate not found'), 404);

    const offer = await prisma.offer.findFirst({
      where: { id: params.id, job: { candidateId: candidate.id } },
      include: { job: true },
    });
    if (!offer) return errorResponse(new Error('Offer not found'), 404);

    const script = await generateNegotiationScript({
      currentOffer: offer.salary ?? 0,
      targetSalary: validation.data.targetSalary,
      jobTitle: offer.job.title,
      company: offer.job.company,
      competingOffer: validation.data.competingOffer,
      keyAchievements: validation.data.keyAchievements,
    });

    return successResponse(script, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
