import { NextRequest, NextResponse } from 'next/server';

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

    // TODO: Wire to Prisma
    // const candidate = await prisma.candidate.findUnique({
    //   where: { id: candidateId },
    //   include: {
    //     profileScore: true,
    //     profileEntities: true,
    //     skills: true,
    //     achievements: true,
    //   },
    // });

    // Mock response
    const profile = {
      candidateId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      completenessScore: {
        totalScore: 65,
        personalInfoScore: 90,
        resumeScore: 70,
        skillsScore: 60,
        experienceScore: 50,
        educationScore: 80,
        goalsScore: 40,
        portfolioScore: 30,
        completeness: 0.65,
      },
      topSkills: [
        { name: 'React', category: 'technical', proficiency: 'expert' },
        { name: 'TypeScript', category: 'technical', proficiency: 'proficient' },
      ],
      recentAchievements: [
        { title: 'Led team to 50% performance improvement', date: new Date() },
      ],
      extractionQuality: {
        totalEntities: 45,
        averageConfidence: 0.87,
        documentCount: 3,
        lastExtraction: new Date(),
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

    // TODO: Wire to Prisma
    // const updated = await prisma.candidate.update({
    //   where: { id: candidateId },
    //   data: body,
    // });

    const updated = { candidateId, ...body, updatedAt: new Date() };

    return NextResponse.json({ profile: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
