/**
 * GET /api/fit-engine/deconstruction?jobId={id}
 * Returns the full job deconstruction data for a given job.
 *
 * POST /api/fit-engine/deconstruction
 * Re-runs deconstruction only (no full pipeline).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { deconstructJob } from '@/lib/fit-engine/job-deconstruction/pipeline';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ component: 'api:fit-engine:deconstruction' });

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId query parameter is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: session.user.email },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const intelligence = await prisma.jobIntelligence.findUnique({
      where: { jobId },
      include: {
        requirementBreakdowns: true,
        businessProblems: true,
        operationalSignals: true,
      },
    });

    if (!intelligence) {
      return NextResponse.json({ error: 'No deconstruction found for this job' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: intelligence });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deconstruction', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: session.user.email },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const result = await deconstructJob({
      jobId: job.id,
      candidateId: candidate.id,
      jobTitle: job.title,
      company: job.company,
      rawJdText: job.description || '',
      userId: candidate.email,
      correlationId: `api-redecon-${Date.now()}`,
    });

    logger.info({ jobId: job.id, inferredRole: result.result.inferredRole.title }, 'Deconstruction re-run completed');

    return NextResponse.json({
      success: true,
      data: result.result,
      meta: {
        executionId: result.executionId,
        tokenUsage: result.tokenUsage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Deconstruction failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
