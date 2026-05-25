import { prisma } from '@/lib/db';
import type { OpportunityHealthInput } from './types';

/**
 * Fetch job + related counts and assemble an OpportunityHealthInput ready for scoreOpportunityHealth.
 * Returns null when the job does not exist or does not belong to candidateId.
 */
export async function buildOpportunityHealthInput(
  jobId: string,
  candidateId: string,
): Promise<OpportunityHealthInput | null> {
  const job = await prisma.job.findFirst({
    where: { id: jobId, candidateId },
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

  if (!job) return null;

  const [contactCount, activeWorkflowCount] = await Promise.all([
    prisma.contact.count({ where: { candidateId, jobId } }),
    prisma.workflowExecution.count({
      where: {
        candidateId,
        jobId,
        status: { in: ['queued', 'running', 'waiting_for_approval'] },
      },
    }),
  ]);

  const lastActivity = job.activities[0]?.createdAt ?? new Date(0);
  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    jobId,
    candidateId,
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
}
