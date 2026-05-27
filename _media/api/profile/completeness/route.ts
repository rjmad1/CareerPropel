import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/profile/completeness?candidateId={id}
 * Compute profile completeness score from actual schema data.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    const [candidate, skillCount, achievementCount, profileDataCount] = await Promise.all([
      prisma.candidate.findUnique({ where: { id: candidateId } }),
      prisma.skill.count({ where: { candidateId } }),
      prisma.achievement.count({ where: { candidateId } }),
      prisma.profileData.count({ where: { candidateId } }),
    ]);

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const score = Math.min(
      100,
      (skillCount > 0 ? 25 : 0) +
        (achievementCount > 0 ? 25 : 0) +
        (profileDataCount > 0 ? 25 : 0) +
        (candidate.name ? 25 : 0)
    );

    return NextResponse.json({
      candidateId,
      score,
      breakdown: { skills: skillCount, achievements: achievementCount, profileData: profileDataCount },
    });
  } catch (error) {
    console.error('Error fetching completeness score:', error);
    return NextResponse.json({ error: 'Failed to fetch completeness score' }, { status: 500 });
  }
}

export async function PUT(_request: NextRequest) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}
