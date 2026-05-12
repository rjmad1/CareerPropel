import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/entities?candidateId={id}&type={type}
 * Fetch profile entities with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = request.nextUrl.searchParams.get('candidateId');
    const type = request.nextUrl.searchParams.get('type');
    const source = request.nextUrl.searchParams.get('source');
    const confidence = parseFloat(request.nextUrl.searchParams.get('confidence') || '0');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    // TODO: Wire to Prisma
    // const entities = await prisma.profileEntity.findMany({
    //   where: {
    //     candidateId,
    //     ...(type && { type }),
    //     ...(source && { source }),
    //     ...(confidence && { confidence: { gte: confidence } }),
    //   },
    // });

    // Mock response
    const entities = [
      {
        id: 'entity_1',
        candidateId,
        type: 'skill',
        content: 'React',
        confidence: 0.95,
        source: 'resume',
        tags: ['frontend', 'javascript'],
        relatedEntityIds: [],
        extractedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'entity_2',
        candidateId,
        type: 'achievement',
        content: 'Led 50% performance improvement',
        confidence: 0.88,
        source: 'resume',
        tags: ['leadership', 'impact'],
        relatedEntityIds: [],
        extractedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return NextResponse.json({ entities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching entities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entities' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/entities
 * Create profile entity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // TODO: Wire to Prisma
    // const entity = await prisma.profileEntity.create({
    //   data: body,
    // });

    const entity = {
      id: 'entity_' + Date.now(),
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error('Error creating entity:', error);
    return NextResponse.json(
      { error: 'Failed to create entity' },
      { status: 500 }
    );
  }
}
