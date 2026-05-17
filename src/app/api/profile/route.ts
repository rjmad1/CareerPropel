import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/profile?candidateId={id}
 * Fetch complete profile summary
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        profileScore: true,
        profileEntities: true,
        skills: true,
        achievements: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const profile = {
      candidateId: candidate.id,
      name: candidate.name,
      email: candidate.email,
      completenessScore: candidate.profileScore,
      topSkills: candidate.skills.slice(0, 5),
      recentAchievements: candidate.achievements.slice(0, 5),
      extractionQuality: {
        totalEntities: candidate.profileEntities.length,
        averageConfidence: candidate.profileEntities.length > 0
          ? candidate.profileEntities.reduce((sum: number, e: any) => sum + e.confidence, 0) / candidate.profileEntities.length
          : 0,
        documentCount: await prisma.profileData.count({
          where: { candidateId },
        }),
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
 * PUT /api/profile?candidateId={id}
 * Update profile data
 */
export async function PUT(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');
    const body = await request.json();

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.candidate.update({
      where: { id: candidateId },
      data: body,
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
