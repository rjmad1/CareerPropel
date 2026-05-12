import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/completeness?candidateId={id}
 * Fetch profile completeness scores
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    // TODO: Wire to Prisma
    // const score = await prisma.profileScore.findUnique({
    //   where: { candidateId },
    // });

    // Mock response
    const score = {
      id: 'score_' + candidateId,
      candidateId,
      totalScore: 65,
      personalInfoScore: 90,
      resumeScore: 70,
      skillsScore: 60,
      experienceScore: 50,
      educationScore: 80,
      goalsScore: 40,
      portfolioScore: 30,
      completeness: 0.65,
      lastUpdated: new Date(),
    };

    return NextResponse.json(score, { status: 200 });
  } catch (error) {
    console.error('Error fetching completeness:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completeness' },
      { status: 500 }
    );
  }
}
