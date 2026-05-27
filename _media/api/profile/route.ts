import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic'

/**
 * GET /api/profile
 * Fetch the authenticated user's profile summary.
 * candidateId is resolved from the session — callers cannot enumerate other users.
 */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      include: {
        skills: true,
        achievements: true,
        profileData: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const profileDataCount = candidate.profileData.length;

    const profile = {
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      topSkills: candidate.skills.slice(0, 5),
      recentAchievements: candidate.achievements.slice(0, 5),
      extractionQuality: {
        documentCount: profileDataCount,
        lastExtraction: candidate.updatedAt,
      },
    };

    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update the authenticated user's profile data.
 * candidateId is resolved from the session — users cannot update other candidates.
 */
export async function PUT(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    const body = await request.json();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const { name, email } = body;
    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { name, email },
    });

    return NextResponse.json({ profile: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
