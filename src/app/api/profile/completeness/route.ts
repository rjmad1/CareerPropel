import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/profile/completeness?candidateId={id}
 * Fetch profile completeness score and breakdown
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

    if (!score) {
      return NextResponse.json(
        { error: 'Profile score not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(score, { status: 200 });
  } catch (error) {
    console.error('Error fetching completeness score:', error);
    return NextResponse.json(
      { error: 'Failed to fetch completeness score' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/completeness?candidateId={id}
 * Update profile completeness score
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

    const updated = await prisma.profileScore.update({
      where: { candidateId },
      data: body,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating completeness score:', error);
    return NextResponse.json(
      { error: 'Failed to update completeness score' },
      { status: 500 }
    );
  }
}
