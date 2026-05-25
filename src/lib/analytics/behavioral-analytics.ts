/**
 * Behavioral & Execution Analytics
 *
 * Tracks application cadence, follow-up consistency, recruiter response patterns,
 * and workflow effectiveness from user activity data. Identifies:
 *   - burnout risk (inactivity, declining volume)
 *   - inconsistent follow-through (overdue contacts)
 *   - timing patterns (peak application days vs. optimal recruiter review windows)
 *   - high-performing vs. low-performing workflow habits
 */

import { prisma } from '@/lib/db';
import { scored, sampleConfidence } from './governance';
import { MS_PER_DAY } from '@/lib/utils/constants';
import type { BehavioralAnalytics, BehavioralInsight, CadenceMetric, ResponsePattern } from './types';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const RECRUITER_RESPONSE_STAGES = new Set(['recruiter_screen', 'hiring_manager']);
const APPLIED_STAGES = new Set([
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
  'offer',
  'negotiation',
  'rejected',
]);

function mode<T>(arr: T[]): T | null {
  if (arr.length === 0) return null;
  const freq = new Map<T, number>();
  for (const v of arr) freq.set(v, (freq.get(v) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = 0;
  for (const [v, c] of freq) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

export interface BehavioralAnalyticsResult extends BehavioralAnalytics {
  generatedAt: string;
}

export async function computeBehavioralAnalytics(
  candidateId: string,
): Promise<BehavioralAnalyticsResult> {
  const now = Date.now();
  const ninetyDaysAgo = now - 90 * MS_PER_DAY;
  const thirtyDaysAgo = now - 30 * MS_PER_DAY;
  const sixtyDaysAgo = now - 60 * MS_PER_DAY;

  const [jobs, contacts, agentExecs] = await Promise.all([
    prisma.job.findMany({
      where: { candidateId },
      select: {
        id: true,
        stage: true,
        createdAt: true,
        appliedAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.contact.findMany({
      where: { candidateId },
      select: {
        status: true,
        lastContactedAt: true,
        followUpAt: true,
        createdAt: true,
      },
    }),
    prisma.agentExecution.findMany({
      where: { userId: candidateId, status: 'completed' },
      select: { agentType: true, createdAt: true, durationMs: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ]);

  const jobIds = jobs.map((j) => j.id);
  const activities =
    jobIds.length > 0
      ? await prisma.jobActivity.findMany({
          where: { jobId: { in: jobIds }, action: 'stage_changed' },
          select: { jobId: true, metadata: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        })
      : [];

  // ── Application Cadence ────────────────────────────────────────────────────
  const appsLast90 = jobs.filter((j) => j.createdAt.getTime() > ninetyDaysAgo);
  const appsLast30 = jobs.filter((j) => j.createdAt.getTime() > thirtyDaysAgo);
  const appsPrev30 = jobs.filter(
    (j) =>
      j.createdAt.getTime() > sixtyDaysAgo &&
      j.createdAt.getTime() <= thirtyDaysAgo,
  );

  const appsPerWeek = appsLast90.length > 0 ? parseFloat((appsLast90.length / 13).toFixed(1)) : 0;

  const appDays = appsLast90.map((j) => DAYS_OF_WEEK[j.createdAt.getDay()]);
  const peakDayOfWeek = mode(appDays);

  let trend: CadenceMetric['trend'] = 'stable';
  if (appsLast30.length > appsPrev30.length * 1.25) trend = 'increasing';
  else if (appsLast30.length < appsPrev30.length * 0.75 && appsPrev30.length > 0) trend = 'declining';

  // Consistency: % of the last 13 weeks with ≥1 application
  const weekCounts: number[] = Array<number>(13).fill(0);
  for (const j of appsLast90) {
    const weeksAgo = Math.floor((now - j.createdAt.getTime()) / (7 * MS_PER_DAY));
    if (weeksAgo < 13) weekCounts[weeksAgo]++;
  }
  const activeWeeks = weekCounts.filter((c) => c > 0).length;
  const consistency = Math.round((activeWeeks / 13) * 100);

  const cadence: CadenceMetric = { appsPerWeek, trend, peakDayOfWeek, consistency };

  // ── Follow-up Consistency ──────────────────────────────────────────────────
  const overdueFollowUps = contacts.filter(
    (c) =>
      c.followUpAt != null &&
      c.followUpAt < new Date() &&
      c.status !== 'closed',
  );
  const followUpScore =
    contacts.length > 0
      ? Math.max(0, Math.round(100 - (overdueFollowUps.length / contacts.length) * 100))
      : 100;
  const followUpConf = sampleConfidence(contacts.length);

  // ── Recruiter Response Patterns ────────────────────────────────────────────
  const responseTimesMs: number[] = [];
  const responseDays: string[] = [];

  for (const act of activities) {
    const meta = act.metadata as { to?: string } | null;
    if (!meta?.to || !RECRUITER_RESPONSE_STAGES.has(meta.to)) continue;

    const job = jobs.find((j) => j.id === act.jobId);
    if (job?.appliedAt) {
      const ms = act.createdAt.getTime() - job.appliedAt.getTime();
      if (ms > 0 && ms < 90 * MS_PER_DAY) responseTimesMs.push(ms);
    }
    responseDays.push(DAYS_OF_WEEK[act.createdAt.getDay()]);
  }

  const avgResponseDays =
    responseTimesMs.length > 0
      ? Math.round(
          responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length / MS_PER_DAY,
        )
      : null;

  const appliedCount = jobs.filter((j) => APPLIED_STAGES.has(j.stage)).length;
  const responseCount = jobs.filter((j) =>
    ['recruiter_screen', 'hiring_manager', 'technical_interview', 'system_design', 'behavioral', 'final_round', 'offer', 'negotiation'].includes(j.stage),
  ).length;
  const responseRate =
    appliedCount > 0 ? Math.round((responseCount / appliedCount) * 100) : null;

  const responsePattern: ResponsePattern = {
    avgResponseDays,
    responseRate,
    bestResponseDayOfWeek: mode(responseDays),
  };

  // ── Burnout Risk ───────────────────────────────────────────────────────────
  const mostRecentJobMs =
    jobs.length > 0 ? Math.max(...jobs.map((j) => j.updatedAt.getTime())) : 0;
  const inactivityDays =
    mostRecentJobMs > 0 ? Math.floor((now - mostRecentJobMs) / MS_PER_DAY) : 999;

  let burnoutRiskLevel: 'low' | 'medium' | 'high' = 'low';
  if (inactivityDays > 21 && appsLast30.length === 0) {
    burnoutRiskLevel = 'high';
  } else if (
    (trend === 'declining' && consistency < 30) ||
    (appsPerWeek < 0.5 && jobs.length > 5)
  ) {
    burnoutRiskLevel = 'medium';
  }

  const burnoutConf = sampleConfidence(appsLast90.length);

  // ── Workflow Effectiveness ─────────────────────────────────────────────────
  // Composite: follow-up consistency (40%) + application consistency (30%) + agent utilization (30%)
  const agentLast30 = agentExecs.filter((e) => e.createdAt.getTime() > thirtyDaysAgo);
  // Agent utilization: reward regular use (>= 3 runs/week = full score)
  const agentUtilization = Math.min(100, Math.round((agentLast30.length / 12) * 100));

  const workflowScore = Math.round(
    followUpScore * 0.4 + consistency * 0.3 + agentUtilization * 0.3,
  );
  const workflowConf = sampleConfidence(jobs.length + contacts.length);

  // ── Behavioral Insights ────────────────────────────────────────────────────
  const insights: BehavioralInsight[] = [];

  if (burnoutRiskLevel === 'high') {
    insights.push({
      category: 'burnout',
      severity: 'critical',
      message: `No meaningful job search activity in ${inactivityDays > 90 ? '90+' : inactivityDays} days`,
      recommendation:
        'Schedule 2–3 targeted applications this week. Start with your highest-match opportunities to rebuild momentum.',
    });
  } else if (burnoutRiskLevel === 'medium') {
    insights.push({
      category: 'burnout',
      severity: 'warning',
      message: 'Application volume is low — potential search fatigue detected',
      recommendation:
        'Set a weekly application minimum (2–5). Block a focused 60-minute window per week for job search.',
    });
  }

  if (trend === 'declining' && appsPrev30.length > 0) {
    insights.push({
      category: 'cadence',
      severity: 'warning',
      message: `Application volume declining: ${appsLast30.length} this month vs ${appsPrev30.length} last month`,
      recommendation:
        "Review your target role list and ensure it's refreshed. Declining volume often signals a stale target set.",
    });
  }

  if (overdueFollowUps.length >= 3) {
    insights.push({
      category: 'follow_up',
      severity: 'warning',
      message: `${overdueFollowUps.length} contacts are overdue for follow-up`,
      recommendation:
        'Spend 20 minutes in your CRM and action overdue follow-ups. Warm relationships convert at 3–5× the rate of cold applications.',
    });
  }

  if (peakDayOfWeek && ['Saturday', 'Sunday'].includes(peakDayOfWeek)) {
    insights.push({
      category: 'timing',
      severity: 'info',
      message: `Most applications submitted on ${peakDayOfWeek}`,
      recommendation:
        'Recruiters typically review new applications Tuesday–Thursday. Shift your submission timing for better visibility.',
    });
  }

  if (consistency < 40 && appsPerWeek > 0) {
    insights.push({
      category: 'cadence',
      severity: 'info',
      message: 'Inconsistent weekly application cadence detected',
      recommendation:
        'Consistent weekly activity outperforms burst-and-pause patterns. Aim for 2–5 quality applications per week, every week.',
    });
  }

  if (agentLast30.length === 0 && jobs.length > 0) {
    insights.push({
      category: 'effectiveness',
      severity: 'info',
      message: 'No AI workflows used in the last 30 days',
      recommendation:
        'AI-assisted resume tailoring and interview prep significantly improve application quality. Use them for your next applications.',
    });
  }

  return {
    applicationCadence: cadence,
    followUpConsistency: scored(followUpScore, followUpConf, 'verified', {
      sampleSize: contacts.length,
    }),
    recruiterResponsePatterns: responsePattern,
    burnoutRisk: scored(burnoutRiskLevel, burnoutConf, 'inferred', {
      sampleSize: appsLast90.length,
      note: 'Inferred from activity recency, application cadence, and pipeline trend',
    }),
    workflowEffectiveness: scored(workflowScore, workflowConf, 'inferred', {
      sampleSize: jobs.length + contacts.length,
      note: 'Composite: follow-up consistency (40%) + application consistency (30%) + AI workflow usage (30%)',
    }),
    insights,
    generatedAt: new Date().toISOString(),
  };
}
