/**
 * POST /api/agents/plan
 *
 * Given a jobId, analyses the job's current state and recommends the next
 * agent to run.  Optionally enqueues it immediately if { enqueue: true }.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { planNextAction, PlannerInput } from '@/lib/agents/plannerPrompt';
import { enqueueAgentExecution } from '@/lib/queue/enqueue';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    let jobId: string;
    let enqueue = false;
    try {
      const body = await request.json();
      jobId = body.jobId;
      enqueue = body.enqueue ?? false;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        candidate: { select: { email: true } },
        documents: { select: { id: true }, take: 1 },
        interviews: {
          where: { status: 'scheduled', scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: 'asc' },
          take: 1,
          select: { scheduledAt: true },
        },
      },
    });

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    if (job.candidate.email !== email) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Resolve what prep already exists
    const [hasResearch, hasInterviewPrep, lastActivity] = await Promise.all([
      prisma.agentExecution.findFirst({
        where: { userId: email, agentType: 'research', status: 'completed', jobId },
        select: { id: true },
      }),
      prisma.interviewPrep.findUnique({ where: { jobId }, select: { prepStatus: true } }),
      prisma.jobActivity.findFirst({
        where: { jobId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const daysSinceLast = lastActivity
      ? Math.floor((Date.now() - lastActivity.createdAt.getTime()) / 86_400_000)
      : 999;

    const nextInterview = job.interviews[0];
    const upcomingInterviewDays = nextInterview
      ? Math.floor((nextInterview.scheduledAt.getTime() - Date.now()) / 86_400_000)
      : null;

    const input: PlannerInput = {
      jobTitle: job.title,
      company: job.company,
      stage: job.stage,
      matchScore: job.matchScore ?? 0,
      hasResume: Boolean(job.documents?.length),
      hasResearch: Boolean(hasResearch),
      hasInterviewPrep: hasInterviewPrep?.prepStatus === 'ready',
      daysSinceLastActivity: daysSinceLast,
      upcomingInterviewDays,
    };

    const decision = await planNextAction(input);

    let executionId: string | undefined;
    if (enqueue && decision.recommendedAgent && process.env.QUEUE_EXECUTION_ENABLED === 'true') {
      try {
        executionId = await enqueueAgentExecution(decision.recommendedAgent, email, {
          jobId,
          companyName: job.company,
          jobDescription: job.description ?? '',
        });
      } catch (e: any) {
        console.warn('[plan] Enqueue skipped:', e.message);
      }
    }

    return NextResponse.json({ decision, executionId: executionId ?? null });
  } catch (error) {
    console.error('[plan] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
