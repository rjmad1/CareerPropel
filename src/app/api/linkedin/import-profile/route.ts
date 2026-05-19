import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { importLinkedInProfile } from '@/lib/scraping/linkedin';
import { prisma } from '@/lib/db';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const Schema = z.object({
  profileUrl: z
    .string()
    .url()
    .refine((u) => u.includes('linkedin.com/in/'), {
      message: 'Must be a LinkedIn profile URL (linkedin.com/in/…)',
    }),
});

/**
 * POST /api/linkedin/import-profile
 * Scrapes a public LinkedIn profile and upserts skills + experience
 * into the candidate's ProfileData record.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error(parsed.error.issues[0]?.message ?? 'Invalid URL'));
    }

    const { profileUrl } = parsed.data;

    const candidate = await prisma.candidate.findUniqueOrThrow({
      where: { email: userEmail },
      select: { id: true },
    });

    const profile = await importLinkedInProfile(profileUrl);

    // Upsert a "linkedin_export" ProfileData row
    await prisma.profileData.upsert({
      where: { candidateId_type: { candidateId: candidate.id, type: 'linkedin_export' } },
      create: {
        candidateId: candidate.id,
        type: 'linkedin_export',
        content: profile as object,
      },
      update: {
        content: profile as object,
      },
    });

    // Upsert skills extracted from LinkedIn
    for (const skill of profile.skills) {
      await prisma.skill.upsert({
        where: { candidateId_name: { candidateId: candidate.id, name: skill } },
        create: { candidateId: candidate.id, name: skill },
        update: {},
      });
    }

    return successResponse({
      name: profile.name,
      headline: profile.headline,
      experience: profile.experience.length,
      education: profile.education.length,
      skills: profile.skills.length,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
