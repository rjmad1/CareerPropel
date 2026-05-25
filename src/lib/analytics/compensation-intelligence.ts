/**
 * Compensation Intelligence
 *
 * Aggregates offers, job target salaries, and negotiation outcomes to produce:
 *   - Offer comparison table
 *   - Salary trajectory (chronological)
 *   - Estimated compensation percentile (clearly labeled as estimated)
 *   - Negotiation effectiveness
 *
 * All estimated values are labeled. No third-party market data is used.
 */

import { prisma } from '@/lib/db';
import { scored, estimatePercentile, sampleConfidence } from './governance';
import type {
  CompensationAnalysis,
  OfferSummary,
  CompensationPoint,
  NegotiationOutcome,
} from './types';

export interface CompensationIntelligenceResult extends CompensationAnalysis {
  totalOffers: number;
  negotiatedCount: number;
  negotiationSuccessRate: number | null; // % of negotiated offers that resulted in accepted
  avgSalaryAllOffers: number | null;
  maxSalaryOffered: number | null;
  minSalaryOffered: number | null;
  generatedAt: string;
}

export async function computeCompensationIntelligence(
  candidateId: string,
): Promise<CompensationIntelligenceResult> {
  const [offers, jobs] = await Promise.all([
    prisma.offer.findMany({
      where: { candidateId },
      include: {
        job: { select: { title: true, company: true, createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.job.findMany({
      where: { candidateId, salary: { gt: 0 } },
      select: {
        id: true,
        title: true,
        company: true,
        salary: true,
        stage: true,
        createdAt: true,
        appliedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // ── Offer Summaries ────────────────────────────────────────────────────────
  const offerSummaries: OfferSummary[] = offers.map((o) => ({
    jobId: o.jobId,
    company: o.job.company,
    title: o.job.title,
    salary: o.salary,
    equity: o.equity,
    bonus: o.bonus,
    status: o.status,
    negotiated: o.negotiated,
    totalComp: o.salary != null ? o.salary + (o.bonus ?? 0) : null,
  }));

  // ── Salary Trajectory ──────────────────────────────────────────────────────
  const compPoints: CompensationPoint[] = [];

  // Primary: offers with explicit salary
  for (const o of offers) {
    if (o.salary != null && o.salary > 0) {
      compPoints.push({
        date: o.createdAt.toISOString().slice(0, 10),
        salary: o.salary,
        company: o.job.company,
      });
    }
  }

  // Supplement: job target salaries when offer data is sparse
  if (compPoints.length < 3) {
    for (const j of jobs) {
      if (j.salary != null && j.salary > 0) {
        compPoints.push({
          date: (j.appliedAt ?? j.createdAt).toISOString().slice(0, 10),
          salary: j.salary,
          company: j.company,
        });
      }
    }
  }

  compPoints.sort((a, b) => a.date.localeCompare(b.date));

  const trajectoryConf = sampleConfidence(compPoints.length);
  const trajectorySource =
    compPoints.length > 0
      ? (offers.some((o) => o.salary != null) ? 'verified' : 'inferred')
      : 'estimated';

  // ── Aggregates ─────────────────────────────────────────────────────────────
  const salaries = offerSummaries
    .map((o) => o.salary)
    .filter((s): s is number => s != null && s > 0);

  const avgSalaryAllOffers =
    salaries.length > 0
      ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length)
      : null;
  const maxSalaryOffered = salaries.length > 0 ? Math.max(...salaries) : null;
  const minSalaryOffered = salaries.length > 0 ? Math.min(...salaries) : null;

  // ── Percentile Estimate ────────────────────────────────────────────────────
  const percentileEstimate = avgSalaryAllOffers
    ? estimatePercentile(avgSalaryAllOffers)
    : scored<number | null>(null, 'low', 'estimated', {
        note: 'No offer salary data recorded yet.',
      });

  // ── Negotiation Outcomes ───────────────────────────────────────────────────
  const negotiationOutcomes: NegotiationOutcome[] = offers.map((o) => ({
    company: o.job.company,
    negotiated: o.negotiated,
    status: o.status,
  }));

  const negotiatedCount = offers.filter((o) => o.negotiated).length;
  const acceptedAfterNegotiation = offers.filter(
    (o) => o.negotiated && o.status === 'accepted',
  ).length;
  const negotiationSuccessRate =
    negotiatedCount > 0
      ? Math.round((acceptedAfterNegotiation / negotiatedCount) * 100)
      : null;

  return {
    offers: offerSummaries,
    trajectory: scored(compPoints, trajectoryConf, trajectorySource as 'verified' | 'inferred' | 'estimated', {
      sampleSize: compPoints.length,
      note:
        compPoints.length === 0
          ? 'No salary data recorded. Add offer or job salary data to enable trajectory analysis.'
          : undefined,
    }),
    percentileEstimate,
    negotiationOutcomes,
    benchmarkNote:
      'All compensation data is sourced exclusively from your own recorded offers and job targets. ' +
      'Percentile estimates are heuristic approximations — not verified market data. ' +
      'For accurate market benchmarks, use Levels.fyi, Glassdoor, Blind, or Comprehensive.io.',
    totalOffers: offers.length,
    negotiatedCount,
    negotiationSuccessRate,
    avgSalaryAllOffers,
    maxSalaryOffered,
    minSalaryOffered,
    generatedAt: new Date().toISOString(),
  };
}
