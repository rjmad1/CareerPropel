import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { scoreOpportunityHealth, healthLabel } from '@/lib/workflow/health-scorer';
import type { OpportunityHealthInput } from '@/lib/workflow/types';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } },
) {
  try {
    const { userEmail } = await getAuthContext();
    const c = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!c) return NextResponse.json({ error: { message: 'Profile not found' } }, { status: 404 });

    const job = await prisma.job.findFirst({
      where: { id: params.jobId, candidateId: c.id },
      select: {
        id: true,
        stage: true,
        matchScore: true,
        recruiterName: true,
        recruiterEmail: true,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { createdAt: true },
        },
        interviews: { select: { id: true } },
      },
    });

    if (!job) return NextResponse.json({ error: { message: 'Job not found' } }, { status: 404 });

    const [contactCount, activeWorkflowCount] = await Promise.all([
      prisma.contact.count({ where: { candidateId: c.id, jobId: params.jobId } }),
      prisma.workflowExecution.count({
        where: {
          candidateId: c.id,
          jobId: params.jobId,
          status: { in: ['queued', 'running', 'waiting_for_approval'] },
        },
      }),
    ]);

    const lastActivity = job.activities[0]?.createdAt ?? new Date(0);
    const daysSinceLastActivity = Math.floor(
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
    );

    const input: OpportunityHealthInput = {
      jobId: params.jobId,
      candidateId: c.id,
      matchScore: job.matchScore ?? 0,
      stage: job.stage,
      daysSinceLastActivity,
      hasRecruiterContact: Boolean(job.recruiterEmail ?? job.recruiterName),
      recruiterResponseCount: contactCount,
      interviewCount: job.interviews.length,
      pendingFollowUp: daysSinceLastActivity > 5,
      contactCount,
      activeWorkflowCount,
    };

    const breakdown = scoreOpportunityHealth(input);
    const label = healthLabel(breakdown.overall);

    return NextResponse.json({ data: { breakdown, label, daysSinceLastActivity } });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message ?? 'Failed to compute health score' } },
      { status: err.status ?? 500 },
    );
  }
}
