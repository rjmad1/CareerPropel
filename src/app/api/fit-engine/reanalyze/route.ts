/**
 * POST /api/fit-engine/reanalyze
 *
 * Re-runs specific stages of the fit analysis pipeline.
 * Useful when a stage fails and needs retry, or when resume content
 * changes and you want to re-map strengths / re-score.
 *
 * Body: { jobId, stages: string[], customWeights?: Record<string, number> }
 * stages: array of 'deconstruction' | 'strength-mapping' | 'gap-analysis' | 'fit-scoring'
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { runPartialAnalysis } from '@/lib/fit-engine/agents/orchestrator';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ component: 'api:fit-engine:reanalyze' });

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, stages, customWeights } = body;

    if (!jobId || !stages || !Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json(
        { error: 'jobId and stages array are required' },
        { status: 400 }
      );
    }

    // Validate stage names
    const validStages = ['deconstruction', 'strength-mapping', 'gap-analysis', 'fit-scoring'];
    const invalidStages = stages.filter((s) => !validStages.includes(s));
    if (invalidStages.length > 0) {
      return NextResponse.json(
        { error: `Invalid stage(s): ${invalidStages.join(', ')}. Valid: ${validStages.join(', ')}` },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: session.user.email },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        resumeVariants: { where: { isCurrent: true }, take: 1 },
        jobIntelligence: true,
      },
    });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Gather evidence sources
    const resumeVariant = job.resumeVariants?.[0];
    const resumeContent = resumeVariant?.content || '';

    const accomplishments = await prisma.accomplishment.findMany({
      where: { candidateId: candidate.id },
      select: { title: true, description: true, metrics: true, starContext: true, category: true },
      take: 20,
    });

    const starStories = await prisma.starStory.findMany({
      where: { candidateId: candidate.id },
      select: { title: true, situation: true, task: true, action: true, result: true },
      take: 10,
    });

    // Run partial analysis
    const result = await runPartialAnalysis(
      {
        candidateId: candidate.id,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        rawJdText: job.description || '',
        userId: candidate.email,
        resumeContent,
        accomplishments: accomplishments.map((a) => ({
          title: a.title,
          description: a.description,
          metrics: a.metrics,
          starContext: a.starContext,
          category: a.category,
        })),
        starStories: starStories.map((s) => ({
          title: s.title,
          situation: s.situation,
          task: s.task,
          action: s.action,
          result: s.result,
        })),
        customWeights,
        correlationId: `api-reanalyze-${Date.now()}`,
      },
      stages as Array<'deconstruction' | 'strength-mapping' | 'gap-analysis' | 'fit-scoring'>
    );

    logger.info({ jobId, stages }, 'Re-analysis completed');

    return NextResponse.json({
      success: true,
      data: result.result,
      meta: {
        stages: result.stages,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ err: errorMessage }, 'Re-analysis API error');

    return NextResponse.json(
      { error: 'Re-analysis failed', detail: errorMessage },
      { status: 500 }
    );
  }
}
