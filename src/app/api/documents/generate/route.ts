import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { generateTailoredResume, generateCoverLetter } from '@/lib/document/generator';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const GenerateDocumentSchema = z.object({
  type: z.enum(['resume', 'cover_letter']),
  jobId: z.string().optional(),
  tone: z.enum(['professional', 'enthusiastic', 'concise']).optional(),
  focusAreas: z.array(z.string()).optional(),
  additionalContext: z.string().max(500).optional(),
});

/**
 * POST /api/documents/generate
 * Generate a tailored resume or cover letter using AI.
 * Fetches job context and candidate profile automatically.
 */
import { trackFunnelEvent } from '@/lib/observability/funnel';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) return errorResponse(new Error('Unauthorized'), 401);

    const body = await request.json();
    const validation = GenerateDocumentSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(new Error(validation.error.errors[0].message), 400);
    }

    const { type, jobId, tone, focusAreas, additionalContext } = validation.data;

    await trackFunnelEvent(userEmail, 'job', 'tailor', 'started', { type });

    // Fetch candidate record
    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      include: {
        skills: { take: 20 },
        achievements: { take: 10 },
      },
    });

    // Fetch job context if provided
    let job: { title: string; company: string; description: string | null } | null = null;
    if (jobId) {
      job = await prisma.job.findFirst({
        where: { id: jobId, candidateId: candidate?.id },
        select: { title: true, company: true, description: true },
      });
    }

    const input = {
      type,
      jobTitle: job?.title,
      company: job?.company,
      jobDescription: job?.description ?? undefined,
      candidateName: candidate?.name,
      candidateEmail: userEmail,
      skills: candidate?.skills.map((s) => s.name),
      achievements: candidate?.achievements.map((a) => a.title),
      tone: tone ?? 'professional',
      focusAreas,
      additionalContext,
    };

    const result =
      type === 'resume'
        ? await generateTailoredResume(input)
        : await generateCoverLetter(input);

    await trackFunnelEvent(userEmail, 'job', 'tailor', 'completed', { type });

    return successResponse(result, 201);
  } catch (error) {
    try {
      const { userEmail } = await getAuthContext();
      if (userEmail) {
        await trackFunnelEvent(userEmail, 'job', 'tailor', 'failed', { error: error instanceof Error ? error.message : String(error) });
      }
    } catch {}
    return errorResponse(error);
  }
}
