import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/profile/recommendations?candidateId={id}
 * Fetch profile improvement recommendations
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

    const score = await prisma.profileScore.findUnique({
      where: { candidateId },
    });

    if (!score || !score.recommendations) {
      return NextResponse.json({ recommendations: [] }, { status: 200 });
    }

    return NextResponse.json(
      { recommendations: score.recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
