import { prisma } from '@/lib/db';
import { scoreOpportunityHealth } from './health-scorer';
import type {
  OpportunityPlanResult,
  RecommendedAction,
  OpportunityHealthInput,
  ActionPriority,
  HealthScoreBreakdown,
} from './types';

const PLAN_TTL_HOURS = 12;

function generateActions(
  _jobId: string,
  stage: string,
  health: HealthScoreBreakdown,
  hasInterviewPrep: boolean,
  hasTailoredResume: boolean,
  daysSinceActivity: number,
): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  let idCounter = 0;
  const id = () => `action-${++idCounter}`;

  const urgencyPriority = (score: number): ActionPriority =>
    score >= 80 ? 'urgent' : score >= 60 ? 'high' : score >= 40 ? 'medium' : 'low';

  // Application-readiness: resume tailoring needed
  if (stage === 'resume_tailoring' && !hasTailoredResume) {
    actions.push({
      id: id(),
      title: 'Tailor Resume for Application',
      description: 'Generate a targeted resume variant optimised for this role',
      priority: 'urgent',
      actionType: 'run_workflow',
      workflowTemplateId: 'targeted-application-prep',
      rationale: 'Resume tailoring is required before application submission',
      dueInDays: 1,
    });
  }

  // Research before recruiter/HM screen
  if (['recruiter_screen', 'hiring_manager'].includes(stage)) {
    actions.push({
      id: id(),
      title: 'Research Company Before Screen',
      description: 'Deep-dive company intelligence to prepare for recruiter conversation',
      priority: 'high',
      actionType: 'run_agent',
      agentType: 'research',
      rationale: 'Company research improves recruiter screen performance',
      dueInDays: 1,
    });
  }

  // Interview prep for upcoming interviews
  if (
    ['technical_interview', 'system_design', 'behavioral', 'final_round'].includes(stage) &&
    !hasInterviewPrep
  ) {
    actions.push({
      id: id(),
      title: 'Generate Interview Preparation Package',
      description: 'Create STAR stories, likely questions, and technical prep materials',
      priority: 'urgent',
      actionType: 'run_workflow',
      workflowTemplateId: 'interview-preparation',
      rationale: 'Interview prep significantly improves success rates at this stage',
      dueInDays: 2,
    });
  }

  // Follow-up for inactive applied/screening jobs
  if (daysSinceActivity > 5 && ['applied', 'recruiter_screen'].includes(stage)) {
    actions.push({
      id: id(),
      title: 'Send Recruiter Follow-Up',
      description: 'Draft and send a follow-up to maintain momentum',
      priority: urgencyPriority(100 - health.inactivityPenalty),
      actionType: 'run_workflow',
      workflowTemplateId: 'recruiter-followup',
      rationale: `No activity for ${daysSinceActivity} days — follow-up recommended`,
      dueInDays: daysSinceActivity > 10 ? 0 : 2,
    });
  }

  // Offer evaluation
  if (stage === 'offer' || stage === 'negotiation') {
    actions.push({
      id: id(),
      title: 'Evaluate Offer & Prepare Negotiation',
      description: 'Research compensation benchmarks and develop negotiation strategy',
      priority: 'urgent',
      actionType: 'run_workflow',
      workflowTemplateId: 'offer-evaluation',
      rationale: 'Structured offer evaluation prevents leaving value on the table',
      dueInDays: 1,
    });
  }

  // Networking in early stages
  if (['sourced', 'interested'].includes(stage) && health.networkingEngagement < 40) {
    actions.push({
      id: id(),
      title: 'Initiate Networking Outreach',
      description: 'Identify key contacts and develop outreach strategy',
      priority: 'medium',
      actionType: 'run_workflow',
      workflowTemplateId: 'networking-outreach',
      rationale: 'Referrals significantly improve application success rates',
      dueInDays: 3,
    });
  }

  // New opportunity intake when nothing is done yet
  if (['sourced', 'interested'].includes(stage) && !hasTailoredResume) {
    actions.push({
      id: id(),
      title: 'Run New Opportunity Intake',
      description: 'Score, research, and assess this opportunity end-to-end',
      priority: 'medium',
      actionType: 'run_workflow',
      workflowTemplateId: 'new-opportunity-intake',
      rationale: 'Intake workflow scores match, researches company, and tailors resume',
      dueInDays: 3,
    });
  }

  // Sort by priority order
  const priorityOrder: ActionPriority[] = ['urgent', 'high', 'medium', 'low'];
  return actions.sort(
    (a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority),
  );
}

function suggestWorkflow(stage: string, actions: RecommendedAction[]): string | undefined {
  const urgentWorkflow = actions.find(a => a.priority === 'urgent' && a.workflowTemplateId);
  if (urgentWorkflow) return urgentWorkflow.workflowTemplateId;

  const stageMap: Record<string, string> = {
    sourced:              'new-opportunity-intake',
    interested:           'new-opportunity-intake',
    resume_tailoring:     'targeted-application-prep',
    applied:              'recruiter-followup',
    recruiter_screen:     'recruiter-followup',
    technical_interview:  'interview-preparation',
    system_design:        'interview-preparation',
    behavioral:           'interview-preparation',
    final_round:          'interview-preparation',
    offer:                'offer-evaluation',
    negotiation:          'offer-evaluation',
  };

  return stageMap[stage];
}

/**
 * Generate (or refresh) an opportunity execution plan for a job.
 * Persists the result to OpportunityPlan for retrieval.
 */
export async function generateOpportunityPlan(
  jobId: string,
  candidateId: string,
): Promise<OpportunityPlanResult> {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
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
      documents: { where: { type: 'resume' }, select: { id: true } },
      interviewPrep: { select: { id: true, prepStatus: true } },
    },
  });

  if (!job) throw Object.assign(new Error('Job not found'), { status: 404 });

  // Verify job belongs to candidate
  const ownership = await prisma.job.findFirst({
    where: { id: jobId, candidateId },
    select: { id: true },
  });
  if (!ownership) throw Object.assign(new Error('Forbidden'), { status: 403 });

  const contactCount = await prisma.contact.count({ where: { candidateId, jobId } });
  const activeWorkflowCount = await prisma.workflowExecution.count({
    where: {
      candidateId,
      jobId,
      status: { in: ['queued', 'running', 'waiting_for_approval'] },
    },
  });

  const lastActivity = job.activities[0]?.createdAt ?? new Date(0);
  const daysSinceLastActivity = Math.floor(
    (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24),
  );

  const healthInput: OpportunityHealthInput = {
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

  const health = scoreOpportunityHealth(healthInput);

  const hasInterviewPrep = Boolean(
    job.interviewPrep && job.interviewPrep.prepStatus === 'ready',
  );
  const hasTailoredResume = job.documents.length > 0;

  const actions = generateActions(
    jobId,
    job.stage,
    health,
    hasInterviewPrep,
    hasTailoredResume,
    daysSinceLastActivity,
  );

  // Urgency: driven primarily by inactivity + critical stage proximity
  const urgencyScore = Math.round(
    health.inactivityPenalty < 40 ? 90 :
    health.inactivityPenalty < 65 ? 65 : 30,
  );

  // Readiness: have key artefacts been prepared?
  const readinessScore = Math.min(
    100,
    (hasTailoredResume ? 40 : 0) + (hasInterviewPrep ? 40 : 0) + 20,
  );

  const result: OpportunityPlanResult = {
    jobId,
    urgencyScore,
    readinessScore,
    momentumScore: Math.round(health.overall),
    actions,
    healthBreakdown: health,
    suggestedWorkflow: suggestWorkflow(job.stage, actions),
  };

  // Persist / refresh
  const expiresAt = new Date(Date.now() + PLAN_TTL_HOURS * 60 * 60 * 1000);

  await prisma.opportunityPlan.upsert({
    where: { jobId },
    create: {
      jobId,
      candidateId,
      urgencyScore: result.urgencyScore,
      readinessScore: result.readinessScore,
      momentumScore: result.momentumScore,
      actions: result.actions as any,
      healthBreakdown: result.healthBreakdown as any,
      suggestedWorkflow: result.suggestedWorkflow ?? null,
      generatedAt: new Date(),
      expiresAt,
    },
    update: {
      urgencyScore: result.urgencyScore,
      readinessScore: result.readinessScore,
      momentumScore: result.momentumScore,
      actions: result.actions as any,
      healthBreakdown: result.healthBreakdown as any,
      suggestedWorkflow: result.suggestedWorkflow ?? null,
      generatedAt: new Date(),
      expiresAt,
    },
  });

  return result;
}
