import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { generateEmailTemplate } from '@/lib/document/generator';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const GenerateEmailSchema = z.object({
  type: z.enum(['thank_you', 'follow_up', 'counter_offer', 'withdraw', 'recruiter_reach_out']),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  interviewerName: z.string().optional(),
  candidateName: z.string().optional(),
  daysSinceInterview: z.number().int().min(0).max(90).optional(),
  offerAmount: z.number().positive().optional(),
  targetAmount: z.number().positive().optional(),
  reason: z.string().max(300).optional(),
  context: z.string().max(500).optional(),
});

/**
 * POST /api/emails/generate
 * Generate a professional email using AI (thank-you, follow-up, counter-offer, withdraw).
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthContext();

    const body = await request.json();
    const validation = GenerateEmailSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(new Error(validation.error.errors[0].message), 400);
    }

    const email = await generateEmailTemplate(validation.data);
    return successResponse(email, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
