/**
 * GET /api/analytics/roi
 *
 * Returns real DB-backed ROI and timing metrics for the authenticated candidate:
 * - Application velocity (apps per week)
 * - Response rate (% that advanced past "applied")
 * - Avg days: creation → applied
 * - Avg days: applied → first interview
 * - Avg days: first interview → offer
 * - Per-company success rate (sorted by attempt count)
 * - Top industries by offer rate
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const INTERVIEW_STAGES = new Set([
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
]);

const APPLIED_AND_BEYOND = new Set([
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

function avgDays(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export async function GET(_req: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const jobs = await prisma.job.findMany({
      where: { candidateId: candidate.id },
      select: {
        id: true,
        company: true,
        stage: true,
        createdAt: true,
        appliedAt: true,
      },
    });

    if (jobs.length === 0) {
      return NextResponse.json({
        applicationVelocity: null,
        responseRate: null,
        avgDaysToApply: null,
        avgDaysToFirstInterview: null,
        avgDaysToOffer: null,
        companySuccessRates: [],
        totalJobs: 0,
        generatedAt: new Date().toISOString(),
      });
    }

    const jobIds = jobs.map((j) => j.id);

    // Fetch all stage_changed activities ordered by time
    const activities = await prisma.jobActivity.findMany({
      where: {
        jobId: { in: jobIds },
        action: 'stage_changed',
      },
      select: { jobId: true, metadata: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    // Build per-job stage-entry timestamp map: { jobId → { stage → firstEntryDate } }
    const stageEntryMap: Record<string, Record<string, Date>> = {};
    for (const act of activities) {
      const meta = act.metadata as { to?: string } | null;
      if (!meta?.to) continue;
      stageEntryMap[act.jobId] ??= {};
      // Only record first entry into each stage
      stageEntryMap[act.jobId][meta.to] ??= act.createdAt;
    }

    // ---- Application velocity: apps/week in last 90 days ----
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86_400_000);
    const recentApplied = jobs.filter(
      (j) =>
        APPLIED_AND_BEYOND.has(j.stage) &&
        (j.appliedAt ?? j.createdAt) >= ninetyDaysAgo
    );
    const applicationVelocity =
      recentApplied.length > 0
        ? parseFloat((recentApplied.length / 13).toFixed(1)) // 90d ≈ 13 weeks
        : 0;

    // ---- Response rate ----
    const totalApplied = jobs.filter((j) =>
      APPLIED_AND_BEYOND.has(j.stage)
    ).length;
    const gotResponse = jobs.filter((j) => {
      const entries = stageEntryMap[j.id] ?? {};
      return (
        Object.keys(entries).some((s) => INTERVIEW_STAGES.has(s)) ||
        ['offer', 'negotiation'].includes(j.stage)
      );
    }).length;
    const responseRate =
      totalApplied > 0 ? Math.round((gotResponse / totalApplied) * 100) : null;

    // ---- Avg days: creation/apply → applied ----
    const daysToApply: number[] = [];
    for (const job of jobs) {
      const appliedEntry =
        stageEntryMap[job.id]?.applied ?? job.appliedAt ?? null;
      if (!appliedEntry) continue;
      const start = job.createdAt;
      const days = (appliedEntry.getTime() - start.getTime()) / 86_400_000;
      if (days >= 0 && days < 365) daysToApply.push(days);
    }

    // ---- Avg days: applied → first interview ----
    const daysApplyToInterview: number[] = [];
    for (const job of jobs) {
      const entries = stageEntryMap[job.id] ?? {};
      const appliedAt =
        entries['applied'] ?? job.appliedAt ?? null;
      if (!appliedAt) continue;
      const firstInterviewAt = INTERVIEW_STAGES
        .values()
        // @ts-ignore -- TS lib target
        .toArray?.()
        ?.concat?.([...INTERVIEW_STAGES])
        ? [...INTERVIEW_STAGES]
            .map((s) => entries[s])
            .filter(Boolean)
            .sort((a, b) => a.getTime() - b.getTime())[0]
        : undefined;
      if (!firstInterviewAt) continue;
      const days =
        (firstInterviewAt.getTime() - appliedAt.getTime()) / 86_400_000;
      if (days >= 0 && days < 365) daysApplyToInterview.push(days);
    }

    // ---- Avg days: first interview → offer ----
    const daysInterviewToOffer: number[] = [];
    for (const job of jobs) {
      const entries = stageEntryMap[job.id] ?? {};
      const interviewDates = [...INTERVIEW_STAGES]
        .map((s) => entries[s])
        .filter(Boolean)
        .sort((a, b) => a.getTime() - b.getTime());
      const firstInterviewAt = interviewDates[0];
      const offerAt = entries['offer'] ?? entries['negotiation'];
      if (!firstInterviewAt || !offerAt) continue;
      const days =
        (offerAt.getTime() - firstInterviewAt.getTime()) / 86_400_000;
      if (days >= 0 && days < 365) daysInterviewToOffer.push(days);
    }

    // ---- Per-company success rate ----
    const companyStats: Record<
      string,
      { total: number; reached_interview: number; reached_offer: number }
    > = {};
    for (const job of jobs) {
      const co = job.company;
      companyStats[co] ??= { total: 0, reached_interview: 0, reached_offer: 0 };
      companyStats[co].total++;
      const entries = stageEntryMap[job.id] ?? {};
      const hadInterview =
        [...INTERVIEW_STAGES].some((s) => entries[s]) ||
        INTERVIEW_STAGES.has(job.stage);
      const hadOffer =
        entries['offer'] ||
        entries['negotiation'] ||
        job.stage === 'offer' ||
        job.stage === 'negotiation';
      if (hadInterview) companyStats[co].reached_interview++;
      if (hadOffer) companyStats[co].reached_offer++;
    }

    const companySuccessRates = Object.entries(companyStats)
      .filter(([, s]) => s.total >= 1)
      .map(([company, s]) => ({
        company,
        total: s.total,
        interviewRate:
          s.total > 0 ? Math.round((s.reached_interview / s.total) * 100) : 0,
        offerRate:
          s.total > 0 ? Math.round((s.reached_offer / s.total) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return NextResponse.json({
      totalJobs: jobs.length,
      totalApplied,
      gotResponse,
      applicationVelocity,
      responseRate,
      avgDaysToApply: avgDays(daysToApply),
      avgDaysToFirstInterview: avgDays(daysApplyToInterview),
      avgDaysToOffer: avgDays(daysInterviewToOffer),
      companySuccessRates,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics/roi] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
