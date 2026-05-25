/**
 * Opportunity Quality Intelligence
 *
 * Scores each active opportunity on a 0–100 composite quality scale derived from:
 *   - AI match score
 *   - Stage progression history
 *   - Staleness (days since last update)
 *   - Compensation alignment vs. the candidate's own target range
 *   - Per-company historical success rate (self-reported data only)
 *
 * All inferences are labeled. No fabricated market data.
 */

import { prisma } from '@/lib/db';
import { sampleConfidence, scored } from './governance';
import type {
  OpportunityQualityScore,
  OpportunitySignal,
  OpportunityAlert,
} from './types';

const ACTIVE_STAGES = new Set([
  'interested',
  'resume_tailoring',
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
  'offer',
  'negotiation',
]);

const INTERVIEW_STAGES = new Set([
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
]);

export interface OpportunityQualityResult {
  scores: OpportunityQualityScore[];
  highProbability: OpportunityQualityScore[];
  lowROI: OpportunityQualityScore[];
  compensationMismatches: string[];
  totalActive: number;
  generatedAt: string;
}

export async function computeOpportunityQuality(
  candidateId: string,
): Promise<OpportunityQualityResult> {
  const jobs = await prisma.job.findMany({
    where: { candidateId },
    select: {
      id: true,
      title: true,
      company: true,
      stage: true,
      salary: true,
      matchScore: true,
      priority: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      appliedAt: true,
    },
  });

  if (jobs.length === 0) {
    return {
      scores: [],
      highProbability: [],
      lowROI: [],
      compensationMismatches: [],
      totalActive: 0,
      generatedAt: new Date().toISOString(),
    };
  }

  const jobIds = jobs.map((j) => j.id);

  const stageActivities = await prisma.jobActivity.findMany({
    where: { jobId: { in: jobIds }, action: 'stage_changed' },
    select: { jobId: true, metadata: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Build stage history per job: { jobId → Set<stage> }
  const stageHistoryMap: Record<string, Set<string>> = {};
  for (const act of stageActivities) {
    const meta = act.metadata as { to?: string } | null;
    if (!meta?.to) continue;
    stageHistoryMap[act.jobId] ??= new Set();
    stageHistoryMap[act.jobId].add(meta.to);
  }

  // Per-company historical stats (derived from user's own data)
  const companyStats: Record<
    string,
    { attempts: number; interviews: number; offers: number }
  > = {};
  for (const job of jobs) {
    const co = job.company;
    companyStats[co] ??= { attempts: 0, interviews: 0, offers: 0 };
    companyStats[co].attempts++;
    const stages = stageHistoryMap[job.id] ?? new Set<string>();
    if ([...stages].some((s) => INTERVIEW_STAGES.has(s)) || INTERVIEW_STAGES.has(job.stage)) {
      companyStats[co].interviews++;
    }
    if (['offer', 'negotiation'].includes(job.stage)) companyStats[co].offers++;
  }

  // Candidate's own salary target range (used for compensation mismatch detection)
  const targetSalaries = jobs
    .filter((j) => j.salary != null && j.salary > 0)
    .map((j) => j.salary as number);
  const avgTargetSalary =
    targetSalaries.length > 0
      ? targetSalaries.reduce((a, b) => a + b, 0) / targetSalaries.length
      : null;

  const scores: OpportunityQualityScore[] = [];
  const compensationMismatches: string[] = [];

  for (const job of jobs) {
    if (!ACTIVE_STAGES.has(job.stage)) continue;

    const signals: OpportunitySignal[] = [];
    const alerts: OpportunityAlert[] = [];
    let qualityScore = 50; // neutral baseline

    // ── Match Score ────────────────────────────────────────────────────────
    const match = job.matchScore ?? 0;
    if (match >= 80) {
      signals.push({ type: 'positive', label: 'High match score', evidence: `${match.toFixed(0)}% match` });
      qualityScore += 15;
    } else if (match >= 60) {
      signals.push({ type: 'neutral', label: 'Moderate match score', evidence: `${match.toFixed(0)}% match` });
      qualityScore += 5;
    } else if (match > 0) {
      signals.push({ type: 'negative', label: 'Low match score', evidence: `${match.toFixed(0)}% match` });
      alerts.push({
        severity: 'medium',
        type: 'low_match',
        message: `Match score ${match.toFixed(0)}% is below the recommended 60% threshold`,
      });
      qualityScore -= 10;
    }

    // ── Stage Progression ──────────────────────────────────────────────────
    const stageSet = stageHistoryMap[job.id] ?? new Set<string>();
    const hasReachedInterview =
      [...stageSet].some((s) => INTERVIEW_STAGES.has(s)) || INTERVIEW_STAGES.has(job.stage);
    const isAtOffer = ['offer', 'negotiation'].includes(job.stage);

    if (isAtOffer) {
      signals.push({ type: 'positive', label: 'Active offer/negotiation', evidence: `Currently at ${job.stage} stage` });
      qualityScore += 30;
    } else if (hasReachedInterview) {
      signals.push({ type: 'positive', label: 'Interview engagement', evidence: 'Has progressed to interview stage' });
      qualityScore += 20;
    }

    // ── Staleness ──────────────────────────────────────────────────────────
    const daysSinceUpdate = Math.floor(
      (Date.now() - job.updatedAt.getTime()) / 86_400_000,
    );
    if (
      daysSinceUpdate > 21 &&
      ACTIVE_STAGES.has(job.stage) &&
      !['offer', 'negotiation'].includes(job.stage)
    ) {
      alerts.push({
        severity: 'medium',
        type: 'stale',
        message: `No activity for ${daysSinceUpdate} days`,
      });
      signals.push({
        type: 'negative',
        label: 'Stale opportunity',
        evidence: `Last updated ${daysSinceUpdate} days ago`,
      });
      qualityScore -= 10;
    }

    // ── Priority Signal ────────────────────────────────────────────────────
    if (job.priority === 'high') {
      signals.push({ type: 'positive', label: 'High priority', evidence: 'Marked as high priority' });
      qualityScore += 5;
    } else if (job.priority === 'low') {
      qualityScore -= 5;
    }

    // ── Compensation Mismatch ──────────────────────────────────────────────
    if (avgTargetSalary && job.salary && job.salary > 0) {
      const delta = Math.abs(job.salary - avgTargetSalary) / avgTargetSalary;
      if (delta > 0.30) {
        const direction = job.salary < avgTargetSalary ? 'below' : 'above';
        const pct = Math.round(delta * 100);
        alerts.push({
          severity: 'medium',
          type: 'compensation_mismatch',
          message: `Salary ${pct}% ${direction} your average target compensation`,
        });
        compensationMismatches.push(
          `${job.company} (${job.title}): ${pct}% ${direction} avg`,
        );
        qualityScore -= 8;
      }
    }

    // ── Company Historical Success ─────────────────────────────────────────
    const coStats = companyStats[job.company];
    if (coStats && coStats.attempts >= 2) {
      const rate = coStats.interviews / coStats.attempts;
      if (rate >= 0.5) {
        signals.push({
          type: 'positive',
          label: 'Strong company track record',
          evidence: `${Math.round(rate * 100)}% interview rate at ${job.company} (your history)`,
        });
        qualityScore += 10;
      }
    }

    qualityScore = Math.max(0, Math.min(100, qualityScore));

    // Success probability is a conservative derivative of quality score
    const successProb = Math.round(qualityScore * 0.78);
    const evidenceCount = stageSet.size + (hasReachedInterview ? 2 : 0);
    const probConf = sampleConfidence(evidenceCount);

    let recommendation: OpportunityQualityScore['recommendation'] = 'maintain';
    if (isAtOffer || qualityScore >= 75) recommendation = 'prioritize';
    else if (qualityScore <= 35) recommendation = 'deprioritize';
    else if (alerts.some((a) => a.severity === 'high')) recommendation = 'reconsider';

    scores.push({
      jobId: job.id,
      title: job.title,
      company: job.company,
      qualityScore,
      successProbability: scored(successProb, probConf, 'inferred', {
        sampleSize: evidenceCount,
        note: 'Inferred from match score, stage progression, and historical company data (your own data only)',
      }),
      signals,
      alerts,
      recommendation,
    });
  }

  scores.sort((a, b) => b.qualityScore - a.qualityScore);

  return {
    scores,
    highProbability: scores.filter((s) => s.qualityScore >= 65),
    lowROI: scores.filter((s) => s.qualityScore <= 35),
    compensationMismatches,
    totalActive: scores.length,
    generatedAt: new Date().toISOString(),
  };
}
