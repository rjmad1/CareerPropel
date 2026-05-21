import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/profile/accomplishments
 * Fetch all achievements staged by the logged-in candidate.
 */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const accomplishments = await prisma.accomplishment.findMany({
      where: { candidateId: candidate.id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ accomplishments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching accomplishments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accomplishments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/accomplishments
 * Create a new accomplishment log.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, date, category, description, metrics, starContext, visibility } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: 'Title, category, and description are required' },
        { status: 400 }
      );
    }

    const accomplishment = await prisma.accomplishment.create({
      data: {
        candidateId: candidate.id,
        title,
        date: date ? new Date(date) : new Date(),
        category,
        description,
        metrics: metrics || null,
        starContext: starContext || null,
        visibility: visibility || 'private',
      },
    });

    return NextResponse.json({ accomplishment }, { status: 201 });
  } catch (error) {
    console.error('Error creating accomplishment:', error);
    return NextResponse.json(
      { error: 'Failed to create accomplishment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/accomplishments
 * Edit an existing accomplishment.
 */
export async function PUT(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await request.json();
    const { id, title, date, category, description, metrics, starContext, visibility } = body;

    if (!id) {
      return NextResponse.json({ error: 'Accomplishment ID is required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.accomplishment.findUnique({
      where: { id },
    });

    if (!existing || existing.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Accomplishment not found or unauthorized' }, { status: 404 });
    }

    const updated = await prisma.accomplishment.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        date: date ? new Date(date) : existing.date,
        category: category ?? existing.category,
        description: description ?? existing.description,
        metrics: metrics !== undefined ? metrics : existing.metrics,
        starContext: starContext !== undefined ? starContext : existing.starContext,
        visibility: visibility ?? existing.visibility,
      },
    });

    return NextResponse.json({ accomplishment: updated }, { status: 200 });
  } catch (error) {
    console.error('Error updating accomplishment:', error);
    return NextResponse.json(
      { error: 'Failed to update accomplishment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profile/accomplishments
 * Delete an accomplishment log.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Accomplishment ID is required' }, { status: 400 });
    }

    const existing = await prisma.accomplishment.findUnique({
      where: { id },
    });

    if (!existing || existing.candidateId !== candidate.id) {
      return NextResponse.json({ error: 'Accomplishment not found or unauthorized' }, { status: 404 });
    }

    await prisma.accomplishment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting accomplishment:', error);
    return NextResponse.json(
      { error: 'Failed to delete accomplishment' },
      { status: 500 }
    );
  }
}
