/**
 * POST /api/fit-engine/analyze
 *
 * Runs the full 4-stage fit evaluation pipeline for a single job.
 * Accepts a job ID (must already exist in the database with description populated)
 * or a raw JD text + resume content.
 *
 * Returns the full analysis result with stage-by-stage execution details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { runFullAnalysis } from '@/lib/fit-engine/agents/orchestrator';
import { createLogger } from '@/lib/logging/logger';

const logger = createLogger({ component: 'api:fit-engine:analyze' });

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { jobId, rawJdText, customWeights } = body;

    if (!jobId && !rawJdText) {
      return NextResponse.json(
        { error: 'Either jobId or rawJdText is required' },
        { status: 400 }
      );
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { email: session.user.email },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Get or validate job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        resumeVariants: { where: { isCurrent: true }, take: 1 },
      },
    });
    if (!job && jobId) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Gather inputs
    const jdText = rawJdText || job!.description || '';
    if (!jdText) {
      return NextResponse.json(
        { error: 'No job description text available. Provide rawJdText or ensure the job has a description.' },
        { status: 400 }
      );
    }

    // Gather resume content
    const resumeVariant = job?.resumeVariants?.[0];
    const resumeContent = resumeVariant?.content || '';

    // Gather accomplishments
    const accomplishments = await prisma.accomplishment.findMany({
      where: { candidateId: candidate.id },
      select: { title: true, description: true, metrics: true, starContext: true, category: true },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    // Gather STAR stories
    const starStories = await prisma.starStory.findMany({
      where: { candidateId: candidate.id },
      select: { title: true, situation: true, task: true, action: true, result: true },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    // Run the analysis
    const analysisResult = await runFullAnalysis({
      candidateId: candidate.id,
      jobId: job?.id || 'pending',
      jobTitle: job?.title || 'Unknown Role',
      company: job?.company || 'Unknown Company',
      rawJdText: jdText,
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
      correlationId: `api-${Date.now()}`,
    });

    logger.info(
      { jobId: job?.id, fitScore: analysisResult.result.fitScore.overallFitScore, recommendation: analysisResult.result.fitScore.recommendation },
      'Fit analysis completed via API'
    );

    return NextResponse.json({
      success: true,
      data: analysisResult.result,
      meta: {
        stages: analysisResult.stages,
        analyzedAt: analysisResult.result.analyzedAt,
        analysisVersion: analysisResult.result.analysisVersion,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error({ err: errorMessage }, 'Fit analysis API error');

    return NextResponse.json(
      { error: 'Analysis failed', detail: errorMessage },
      { status: 500 }
    );
  }
}
