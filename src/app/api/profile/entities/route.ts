import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/profile/entities?candidateId={id}&type={type}&source={source}
 * Fetch extracted profile entities
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');
    const type = request.nextUrl.searchParams.get('type');
    const source = request.nextUrl.searchParams.get('source');

    if (!candidateId) {
      return NextResponse.json(
        { error: 'candidateId is required' },
        { status: 400 }
      );
    }

    const where: any = { candidateId };
    if (type) where.type = type;
    if (source) where.source = source;

    const entities = await prisma.profileEntity.findMany({
      where,
      orderBy: { extractedAt: 'desc' },
    });

    return NextResponse.json({ entities, total: entities.length }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile entities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/entities
 * Create a new profile entity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const entity = await prisma.profileEntity.create({
      data: body,
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error('Error creating profile entity:', error);
    return NextResponse.json(
      { error: 'Failed to create profile entity' },
      { status: 500 }
    );
  }
}
