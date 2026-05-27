import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/profile/recommendations?candidateId={id}
 * Return profile improvement recommendations based on completeness gaps.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    const [skillCount, achievementCount, profileDataCount] = await Promise.all([
      prisma.skill.count({ where: { candidateId } }),
      prisma.achievement.count({ where: { candidateId } }),
      prisma.profileData.count({ where: { candidateId } }),
    ]);

    const recommendations: string[] = [];
    if (skillCount === 0) recommendations.push('Add your skills to improve match accuracy');
    if (achievementCount === 0) recommendations.push('Add achievements with quantifiable results');
    if (profileDataCount === 0) recommendations.push('Upload your resume to enable AI-powered tailoring');

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
