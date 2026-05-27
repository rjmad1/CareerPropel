import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * GET /api/profile/entities?candidateId={id}&type={type}
 * Fetch profile data entries (resume, cover_letter, linkedin_export, notes, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');
    const type = request.nextUrl.searchParams.get('type');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    const where: any = { candidateId };
    if (type) where.type = type;

    const entities = await prisma.profileData.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ entities, total: entities.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile entities:', error);
    return NextResponse.json({ error: 'Failed to fetch profile entities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { candidateId, type, content } = body;

    if (!candidateId || !type || !content) {
      return NextResponse.json({ error: 'candidateId, type, and content are required' }, { status: 400 });
    }

    const entity = await prisma.profileData.upsert({
      where: { candidateId_type: { candidateId, type } },
      update: { content },
      create: { candidateId, type, content },
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error('Error creating profile entity:', error);
    return NextResponse.json({ error: 'Failed to create profile entity' }, { status: 500 });
  }
}
