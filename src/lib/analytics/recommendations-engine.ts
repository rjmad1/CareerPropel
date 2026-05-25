/**
 * AI-Powered Strategic Recommendations Engine
 *
 * Generates personalized, evidence-backed career recommendations by:
 *   1. Gathering real analytics context from the user's data
 *   2. Applying rule-based recommendations (always fast, no LLM cost)
 *   3. Enriching with LLM-generated strategic insights when sufficient data exists
 *
 * Every recommendation includes:
 *   - Evidence: the data points that triggered it
 *   - Action: a specific, concrete step to take
 *   - Confidence: high/medium/low based on data quality
 *   - Expected impact: what improvement to expect
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { MS_PER_DAY } from '@/lib/utils/constants';
import type {
  StrategicRecommendation,
  RecommendationCategory,
  ConfidenceLevel,
} from './types';

// ── Internal Analytics Context ────────────────────────────────────────────────

export interface RecommendationContext {
  totalJobs: number;
  activeJobs: number;
  offerCount: number;
  rejectionCount: number;
  overallConversionRate: number | null;
  appsPerWeek: number;
  responseRate: number | null;
  avgMatchScore: number | null;
  burnoutRisk: 'low' | 'medium' | 'high';
  followUpConsistency: number; // 0–100
  overdueFollowUps: number;
  topWeaknesses: string[];
  profileScore: number | null;
  compensationDataPoints: number;
  skillCount: number;
  inactivityDays: number;
  appsLast30Days: number;
  appsPrev30Days: number;
}

let _recCounter = 0;
function nextId(): string {
  return `rec_${Date.now()}_${++_recCounter}`;
}

// ── Context Gathering ─────────────────────────────────────────────────────────

async function gatherContext(candidateId: string): Promise<RecommendationContext> {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * MS_PER_DAY;
  const sixtyDaysAgo = now - 60 * MS_PER_DAY;
  const ninetyDaysAgo = now - 90 * MS_PER_DAY;

  const INTERVIEW_STAGES = new Set([
    'recruiter_screen',
    'hiring_manager',
    'technical_interview',
    'system_design',
    'behavioral',
    'final_round',
  ]);

  const [jobs, offers, contacts, mockSessions, profileScore, skillCount, compensationDataPoints] =
    await Promise.all([
      prisma.job.findMany({
        where: { candidateId },
        select: { id: true, stage: true, matchScore: true, createdAt: true, updatedAt: true },
      }),
      prisma.offer.findMany({ where: { candidateId }, select: { id: true } }),
      prisma.contact.findMany({
        where: { candidateId },
        select: { followUpAt: true, status: true },
      }),
      prisma.mockInterviewSession.findMany({
        where: { candidateId },
        select: { areasForImprovement: true, scores: true },
        take: 15,
        orderBy: { completedAt: 'desc' },
      }),
      prisma.profileScore.findUnique({
        where: { candidateId },
        select: { overall: true },
      }),
      prisma.skill.count({ where: { candidateId } }),
      prisma.job.count({ where: { candidateId, salary: { gt: 0 } } }),
    ]);

  const applied = jobs.filter(
    (j) => !['sourced', 'interested', 'resume_tailoring'].includes(j.stage),
  );
  const reachedInterview = jobs.filter(
    (j) =>
      INTERVIEW_STAGES.has(j.stage) ||
      j.stage === 'offer' ||
      j.stage === 'negotiation',
  );
  const active = jobs.filter(
    (j) => !['rejected', 'archived', 'sourced'].includes(j.stage),
  );

  const appsLast30 = jobs.filter((j) => j.createdAt.getTime() > thirtyDaysAgo);
  const appsPrev30 = jobs.filter(
    (j) =>
      j.createdAt.getTime() > sixtyDaysAgo &&
      j.createdAt.getTime() <= thirtyDaysAgo,
  );
  const appsLast90 = jobs.filter((j) => j.createdAt.getTime() > ninetyDaysAgo);
  const appsPerWeek = parseFloat((appsLast90.length / 13).toFixed(1));

  const matchScores = jobs
    .map((j) => j.matchScore)
    .filter((s): s is number => s != null && s > 0);
  const avgMatchScore =
    matchScores.length > 0
      ? Math.round(matchScores.reduce((a, b) => a + b, 0) / matchScores.length)
      : null;

  const overallConversionRate =
    applied.length > 0
      ? Math.round((offers.length / applied.length) * 100)
      : null;
  const responseRate =
    applied.length > 0
      ? Math.round((reachedInterview.length / applied.length) * 100)
      : null;

  const overdueFollowUps = contacts.filter(
    (c) => c.followUpAt != null && c.followUpAt < new Date() && c.status !== 'closed',
  ).length;
  const followUpConsistency =
    contacts.length > 0
      ? Math.max(0, Math.round(100 - (overdueFollowUps / contacts.length) * 100))
      : 100;

  // Recency-based burnout risk
  const mostRecentJobMs =
    jobs.length > 0 ? Math.max(...jobs.map((j) => j.updatedAt.getTime())) : 0;
  const inactivityDays =
    mostRecentJobMs > 0
      ? Math.floor((now - mostRecentJobMs) / MS_PER_DAY)
      : 999;

  let burnoutRisk: 'low' | 'medium' | 'high' = 'low';
  if (inactivityDays > 21 && appsLast30.length === 0) burnoutRisk = 'high';
  else if (appsPerWeek < 1 || (appsLast30.length < appsPrev30.length * 0.5 && appsPrev30.length > 1)) {
    burnoutRisk = 'medium';
  }

  // Aggregate mock interview weakness themes
  const weaknessFreq = new Map<string, number>();
  for (const s of mockSessions) {
    for (const w of s.areasForImprovement ?? []) {
      weaknessFreq.set(w, (weaknessFreq.get(w) ?? 0) + 1);
    }
  }
  const topWeaknesses = [...weaknessFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => k);

  return {
    totalJobs: jobs.length,
    activeJobs: active.length,
    offerCount: offers.length,
    rejectionCount: jobs.filter((j) => j.stage === 'rejected').length,
    overallConversionRate,
    appsPerWeek,
    responseRate,
    avgMatchScore,
    burnoutRisk,
    followUpConsistency,
    overdueFollowUps,
    topWeaknesses,
    profileScore: profileScore?.overall ?? null,
    compensationDataPoints,
    skillCount,
    inactivityDays,
    appsLast30Days: appsLast30.length,
    appsPrev30Days: appsPrev30.length,
  };
}

// ── Rule-Based Recommendations ────────────────────────────────────────────────

function buildRuleRecommendations(ctx: RecommendationContext): StrategicRecommendation[] {
  const recs: StrategicRecommendation[] = [];

  // Burnout / inactivity
  if (ctx.burnoutRisk === 'high') {
    recs.push({
      id: nextId(),
      category: 'execution_cadence',
      priority: 'critical',
      title: 'Restart Job Search Activity',
      summary: `Your job search has been inactive for ${ctx.inactivityDays > 90 ? '90+' : ctx.inactivityDays} days. Pipeline momentum will stall without regular activity.`,
      evidence: [
        `${ctx.inactivityDays > 90 ? '90+' : ctx.inactivityDays} days since last job search activity`,
        `0 applications in the last 30 days`,
      ],
      action:
        'Schedule 3 targeted applications this week. Start with your highest-match opportunities to rebuild momentum.',
      confidence: 'high',
      expectedImpact: 'Restores pipeline momentum and prevents opportunity gap from widening.',
    });
  }

  // Low match score targeting
  if (ctx.avgMatchScore != null && ctx.avgMatchScore < 60 && ctx.totalJobs >= 3) {
    recs.push({
      id: nextId(),
      category: 'application_strategy',
      priority: 'high',
      title: 'Improve Role Targeting Quality',
      summary: `Your average AI match score of ${ctx.avgMatchScore}% is below the 60% quality threshold. Applying to poor-fit roles reduces response rates.`,
      evidence: [
        `Average match score: ${ctx.avgMatchScore}% across ${ctx.totalJobs} applications`,
        'Industry benchmark: 60%+ match scores correlate with significantly higher response rates',
      ],
      action:
        'Focus exclusively on roles with 65%+ AI match scores. Use match scores as a pre-application filter.',
      confidence: 'high',
      expectedImpact: 'Higher quality applications increase recruiter response rates by an estimated 20–40%.',
    });
  }

  // Low response rate → resume/ATS issue
  if (
    ctx.responseRate != null &&
    ctx.responseRate < 20 &&
    ctx.totalJobs >= 5
  ) {
    recs.push({
      id: nextId(),
      category: 'profile_optimization',
      priority: 'high',
      title: 'Optimize Resume for ATS Pass-Through',
      summary: `Response rate of ${ctx.responseRate}% across ${ctx.totalJobs} applications suggests ATS filtering or targeting issues.`,
      evidence: [
        `${ctx.responseRate}% response rate (target: 20–30%+ for well-targeted applications)`,
        `${ctx.totalJobs} total applications with limited recruiter engagement`,
      ],
      action:
        'Run AI resume tailoring for each application. Ensure keyword alignment with the specific job description before submitting.',
      confidence: 'high',
      expectedImpact: 'Proper ATS optimization typically increases pass-through rates by 15–30%.',
    });
  }

  // Overdue follow-ups
  if (ctx.overdueFollowUps >= 3) {
    recs.push({
      id: nextId(),
      category: 'networking',
      priority: 'medium',
      title: 'Action Overdue Contact Follow-Ups',
      summary: `${ctx.overdueFollowUps} networking contacts are overdue for follow-up. Warm relationships convert at 3–5× the rate of cold applications.`,
      evidence: [
        `${ctx.overdueFollowUps} contacts past their follow-up date`,
        `Follow-up consistency score: ${ctx.followUpConsistency}%`,
      ],
      action:
        'Spend 20 minutes in your CRM and send follow-up messages to overdue contacts. Prioritize recruiters and referral contacts.',
      confidence: 'high',
      expectedImpact: 'Networking consistently produces higher-quality, faster-moving opportunities.',
    });
  }

  // Interview weaknesses
  if (ctx.topWeaknesses.length >= 2) {
    recs.push({
      id: nextId(),
      category: 'interview_prep',
      priority: 'medium',
      title: 'Address Recurring Interview Weaknesses',
      summary: `Mock interview data reveals recurring weak areas that are likely affecting your live interview conversion.`,
      evidence: ctx.topWeaknesses.map((w) => `Recurring weakness: ${w}`),
      action: `Target focused practice on: ${ctx.topWeaknesses.join(', ')}. Use the STAR framework for behavioral questions and timed practice for technical areas.`,
      confidence: 'medium',
      expectedImpact: 'Closing identified skill gaps directly improves interview-to-offer conversion rates.',
    });
  }

  // Profile completeness
  if (ctx.profileScore != null && ctx.profileScore < 70) {
    recs.push({
      id: nextId(),
      category: 'profile_optimization',
      priority: 'medium',
      title: 'Complete Profile to Unlock Better AI Personalization',
      summary: `Profile score of ${ctx.profileScore}/100 means AI tools are operating with incomplete context.`,
      evidence: [
        `Profile completeness score: ${ctx.profileScore}/100`,
        'AI resume tailoring and job matching quality depend on profile completeness',
      ],
      action:
        'Review your profile recommendations and fill in missing sections — especially work history, skills, and career summary.',
      confidence: 'high',
      expectedImpact: 'A complete profile unlocks significantly better AI resume tailoring, matching, and interview prep.',
    });
  }

  // Compensation data gap
  if (ctx.compensationDataPoints === 0 && ctx.totalJobs >= 5) {
    recs.push({
      id: nextId(),
      category: 'compensation_positioning',
      priority: 'low',
      title: 'Record Salary Targets to Enable Compensation Analytics',
      summary: 'No salary data is recorded, so compensation intelligence and negotiation analytics are unavailable.',
      evidence: [`${ctx.totalJobs} jobs with no salary targets recorded`],
      action:
        'Add target salary ranges to your job applications. This enables compensation gap analysis and negotiation tracking.',
      confidence: 'high',
      expectedImpact: 'Enables compensation benchmarking, trajectory analysis, and negotiation outcome tracking.',
    });
  }

  return recs;
}

// ── LLM Strategic Enrichment ──────────────────────────────────────────────────

async function enrichWithLLMRecommendations(
  ctx: RecommendationContext,
): Promise<StrategicRecommendation[]> {
  // Only call LLM when there's enough data to be meaningful
  if (ctx.totalJobs < 3) return [];

  const prompt = `You are a senior career strategy advisor. Based on this job seeker's analytics, generate exactly 2 strategic recommendations that are NOT already covered by these standard rule-based topics: resume ATS, follow-up backlog, profile completeness, interview weaknesses, or burnout/inactivity.

Focus on higher-order strategy: market positioning, compensation strategy, search channel diversification, or execution optimization patterns.

Analytics Context:
- Pipeline: ${ctx.totalJobs} total jobs, ${ctx.activeJobs} active, ${ctx.offerCount} offers, ${ctx.rejectionCount} rejections
- Velocity: ${ctx.appsPerWeek} apps/week (last 90 days)
- Response rate: ${ctx.responseRate ?? 'unknown'}%
- Interview conversion: ${ctx.overallConversionRate ?? 'unknown'}%
- Avg AI match score: ${ctx.avgMatchScore ?? 'unknown'}%
- Burnout risk: ${ctx.burnoutRisk}
- Skills tracked: ${ctx.skillCount}
- Compensation data points: ${ctx.compensationDataPoints}

Return ONLY valid JSON:
{
  "recommendations": [
    {
      "category": "one of: pipeline_health|application_strategy|interview_prep|compensation_positioning|networking|profile_optimization|market_positioning|execution_cadence",
      "priority": "high|medium|low",
      "title": "Concise title (max 8 words)",
      "summary": "2–3 sentences explaining the insight with specific numbers from the data",
      "evidence": ["Specific data point 1", "Specific data point 2"],
      "action": "Specific, actionable next step (1–2 sentences)",
      "confidence": "high|medium|low",
      "expectedImpact": "What measurable improvement to expect"
    }
  ]
}`;

  try {
    const result = await callLLM([{ role: 'user', content: prompt }], {
      systemPrompt:
        'You are a career analytics AI. Respond with valid JSON only. Base all insights strictly on the provided data — no speculation.',
      maxTokens: 700,
      temperature: 0.3,
    });

    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    const parsed = JSON.parse(jsonText) as {
      recommendations: Array<{
        category: string;
        priority: string;
        title: string;
        summary: string;
        evidence: string[];
        action: string;
        confidence: string;
        expectedImpact: string;
      }>;
    };

    if (!Array.isArray(parsed.recommendations)) return [];

    return parsed.recommendations.map((r) => ({
      id: nextId(),
      category: r.category as RecommendationCategory,
      priority: r.priority as StrategicRecommendation['priority'],
      title: r.title,
      summary: r.summary,
      evidence: Array.isArray(r.evidence) ? r.evidence : [],
      action: r.action,
      confidence: r.confidence as ConfidenceLevel,
      expectedImpact: r.expectedImpact ?? '',
    }));
  } catch {
    // LLM failure is non-fatal — rule-based recs still returned
    return [];
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface RecommendationsResult {
  recommendations: StrategicRecommendation[];
  context: RecommendationContext;
  totalCount: number;
  criticalCount: number;
  generatedAt: string;
}

export async function generateStrategicRecommendations(
  candidateId: string,
): Promise<RecommendationsResult> {
  const ctx = await gatherContext(candidateId);

  const ruleRecs = buildRuleRecommendations(ctx);
  const llmRecs = await enrichWithLLMRecommendations(ctx);

  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const allRecs = [...ruleRecs, ...llmRecs].sort(
    (a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4),
  );

  return {
    recommendations: allRecs,
    context: ctx,
    totalCount: allRecs.length,
    criticalCount: allRecs.filter((r) => r.priority === 'critical').length,
    generatedAt: new Date().toISOString(),
  };
}
