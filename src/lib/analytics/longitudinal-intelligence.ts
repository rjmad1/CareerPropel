/**
 * Longitudinal Career Intelligence
 *
 * Historical trend analysis across 6 months of career activity:
 *   - Compensation growth (offer salary trend)
 *   - Skill evolution (skills added over time)
 *   - Interview performance trend (mock session scores)
 *   - Networking expansion (contact growth)
 *   - Pipeline health over time (monthly activity)
 *   - Market alignment (match score quality trend)
 *
 * Creates persistent career intelligence rather than session-based utility.
 */

import { prisma } from '@/lib/db';
import { scored, sampleConfidence } from './governance';
import { MS_PER_DAY } from '@/lib/utils/constants';
import type {
  LongitudinalIntelligence,
  GrowthMetric,
  PipelineHealthPoint,
  PerformanceTrend,
  SkillSnapshot,
} from './types';

function avgOrNull(arr: number[]): number | null {
  return arr.length > 0
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)
    : null;
}

function growthMetric(current: number | null, previous: number | null): GrowthMetric {
  if (current === null || previous === null) {
    return { current, previous, changePercent: null, direction: 'insufficient_data' };
  }
  if (previous === 0) {
    return { current, previous, changePercent: null, direction: 'insufficient_data' };
  }
  const changePercent = Math.round(((current - previous) / previous) * 100);
  const direction =
    changePercent > 5
      ? 'improving'
      : changePercent < -5
        ? 'declining'
        : 'stable';
  return { current, previous, changePercent, direction };
}

export interface LongitudinalIntelligenceResult extends LongitudinalIntelligence {
  generatedAt: string;
}

export async function computeLongitudinalIntelligence(
  candidateId: string,
): Promise<LongitudinalIntelligenceResult> {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 180 * MS_PER_DAY);
  const monthsToTrack = 6;

  const [jobs, offers, skills, mockSessions, contacts] = await Promise.all([
    prisma.job.findMany({
      where: { candidateId },
      select: {
        id: true,
        stage: true,
        matchScore: true,
        createdAt: true,
        appliedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.offer.findMany({
      where: { candidateId },
      select: { salary: true, status: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.skill.findMany({
      where: { candidateId },
      select: { name: true, proficiency: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.mockInterviewSession.findMany({
      where: { candidateId },
      select: { scores: true, completedAt: true },
      orderBy: { completedAt: 'asc' },
    }),
    prisma.contact.findMany({
      where: { candidateId },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // ── Compensation Growth ────────────────────────────────────────────────────
  const offerSalaries = offers.filter((o) => o.salary != null && o.salary > 0);
  const recentOffers = offerSalaries.filter((o) => o.createdAt > sixMonthsAgo);
  const olderOffers = offerSalaries.filter((o) => o.createdAt <= sixMonthsAgo);

  const recentAvgSalary = avgOrNull(recentOffers.map((o) => o.salary as number));
  const olderAvgSalary = avgOrNull(olderOffers.map((o) => o.salary as number));
  const compGrowth = growthMetric(recentAvgSalary, olderAvgSalary);
  const compConf = sampleConfidence(offerSalaries.length);
  const compSource = offerSalaries.length > 0 ? 'verified' : 'estimated';

  // ── Skill Evolution ────────────────────────────────────────────────────────
  const skillSnapshots: SkillSnapshot[] = skills.map((s) => ({
    name: s.name,
    proficiency: s.proficiency,
    addedAt: s.createdAt.toISOString().slice(0, 10),
  }));

  // ── Interview Performance Trend ────────────────────────────────────────────
  const scoredSessions = mockSessions.filter((s) => {
    const sc = s.scores as { overall?: number } | null;
    return typeof sc?.overall === 'number';
  });

  const recentSessions = scoredSessions.filter((s) => s.completedAt > sixMonthsAgo);
  const olderSessions = scoredSessions.filter((s) => s.completedAt <= sixMonthsAgo);

  const getAvgScore = (sessions: typeof scoredSessions): number | null =>
    avgOrNull(
      sessions
        .map((s) => (s.scores as { overall: number }).overall)
        .filter((v): v is number => typeof v === 'number'),
    );

  const recentAvgScore = getAvgScore(recentSessions);
  const historicalAvgScore = getAvgScore(olderSessions);

  let perfDirection: PerformanceTrend['direction'] = 'insufficient_data';
  if (recentAvgScore !== null && historicalAvgScore !== null) {
    if (recentAvgScore > historicalAvgScore * 1.05) perfDirection = 'improving';
    else if (recentAvgScore < historicalAvgScore * 0.95) perfDirection = 'declining';
    else perfDirection = 'stable';
  }

  const perfTrend: PerformanceTrend = {
    recentAvgScore,
    historicalAvgScore,
    direction: perfDirection,
    dataPoints: scoredSessions.length,
  };
  const perfConf = sampleConfidence(scoredSessions.length);

  // ── Networking Expansion ───────────────────────────────────────────────────
  const recentContacts = contacts.filter((c) => c.createdAt > sixMonthsAgo).length;
  const olderContacts = contacts.filter((c) => c.createdAt <= sixMonthsAgo).length;
  const networkGrowth = growthMetric(recentContacts, olderContacts);

  // ── Pipeline Health Over Time ──────────────────────────────────────────────
  const pipelineHealthTrend: PipelineHealthPoint[] = [];
  for (let i = monthsToTrack - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const period = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;

    const newThisMonth = jobs.filter(
      (j) => j.createdAt >= monthStart && j.createdAt <= monthEnd,
    );
    const activeAtMonthEnd = jobs.filter(
      (j) =>
        j.createdAt <= monthEnd &&
        !['rejected', 'archived'].includes(j.stage),
    );

    pipelineHealthTrend.push({
      period,
      totalActive: activeAtMonthEnd.length,
      newApplications: newThisMonth.length,
      offerCount: newThisMonth.filter((j) => j.stage === 'offer').length,
      rejectionCount: newThisMonth.filter((j) => j.stage === 'rejected').length,
    });
  }

  // ── Market Alignment ───────────────────────────────────────────────────────
  // Proxy: % of applications with AI match score ≥ 60
  const scoredJobs = jobs.filter((j) => (j.matchScore ?? 0) > 0);
  const wellAligned = scoredJobs.filter((j) => (j.matchScore ?? 0) >= 60).length;
  const marketAlignmentValue =
    scoredJobs.length > 0 ? Math.round((wellAligned / scoredJobs.length) * 100) : 0;
  const marketAlignConf = sampleConfidence(scoredJobs.length);

  return {
    compensationGrowth: scored(compGrowth, compConf, compSource as 'verified' | 'estimated', {
      sampleSize: offerSalaries.length,
      note:
        offerSalaries.length === 0
          ? 'No offer salary data. Record offer details to enable compensation trend analysis.'
          : undefined,
    }),
    skillEvolution: skillSnapshots,
    interviewPerformanceTrend: scored(perfTrend, perfConf, 'verified', {
      sampleSize: scoredSessions.length,
      note:
        scoredSessions.length === 0
          ? 'No scored mock interview sessions yet. Complete mock interviews to enable performance trend analysis.'
          : undefined,
    }),
    networkingExpansion: networkGrowth,
    pipelineHealthTrend,
    marketAlignment: scored(marketAlignmentValue, marketAlignConf, 'inferred', {
      sampleSize: scoredJobs.length,
      note: 'Proxy metric: % of applications with AI match score ≥ 60%',
    }),
    generatedAt: new Date().toISOString(),
  };
}
