/**
 * GET /api/jobs/[id] - Fetch job details
 * PATCH /api/jobs/[id] - Update job
 * DELETE /api/jobs/[id] - Delete job
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        interviews: true,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('[Jobs API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch job',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
      include: {
        interviews: true,
      },
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('[Jobs Update API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update job',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Jobs Delete API] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to delete job',
      },
      { status: 500 }
    );
  }
}
