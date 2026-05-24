/**
 * GET /api/analytics/forecast
 *
 * Time-to-offer prediction for each active job in the pipeline.
 * Uses the candidate's own historical stage-duration data (or global averages
 * as a fallback) to estimate remaining days to offer from the current stage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { PIPELINE_STAGES, JobStage } from '@/types/job';

export const dynamic = 'force-dynamic';

// Fallback average days per stage (industry baseline)
const BASELINE_DAYS: Partial<Record<JobStage, number>> = {
  interested:           7,
  resume_tailoring:     3,
  applied:              14,
  recruiter_screen:     7,
  hiring_manager:       7,
  technical_interview:  10,
  system_design:        7,
  behavioral:           5,
  final_round:          7,
  offer:                5,
  negotiation:          7,
};

// Stages we consider "terminal" or "inactive" — exclude from forecast
const TERMINAL_STAGES = new Set<JobStage>(['offer', 'negotiation', 'rejected', 'archived', 'sourced']);

function stagesAfter(currentStage: JobStage): JobStage[] {
  const idx = PIPELINE_STAGES.indexOf(currentStage);
  if (idx < 0) return [];
  // Return stages from current+1 up to (but not including) offer/negotiation
  const endIdx = PIPELINE_STAGES.indexOf('offer' as JobStage);
  return PIPELINE_STAGES.slice(idx + 1, endIdx >= 0 ? endIdx : undefined) as JobStage[];
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
      select: { id: true, title: true, company: true, stage: true, createdAt: true, updatedAt: true },
    });

    const jobIds = jobs.map((j) => j.id);

    // Fetch stage_changed activities for timing data
    const activities =
      jobIds.length > 0
        ? await prisma.jobActivity.findMany({
            where: { jobId: { in: jobIds }, action: 'stage_changed' },
            select: { jobId: true, metadata: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
          })
        : [];

    // Build per-job stage-entry map
    const stageEntryMap: Record<string, Record<string, Date>> = {};
    for (const act of activities) {
      const meta = act.metadata as { to?: string } | null;
      if (!meta?.to) continue;
      stageEntryMap[act.jobId] ??= {};
      stageEntryMap[act.jobId][meta.to] ??= act.createdAt;
    }

    // ---- Compute personal average days per stage from historical completed jobs ----
    const stageDurationAccum: Record<string, number[]> = {};
    for (const job of jobs) {
      const entries = stageEntryMap[job.id] ?? {};
      for (let i = 0; i < PIPELINE_STAGES.length - 1; i++) {
        const stage = PIPELINE_STAGES[i];
        const nextStage = PIPELINE_STAGES[i + 1];
        const enteredAt: Date = entries[stage] ?? (i === 0 ? job.createdAt : null as unknown as Date);
        const exitedAt: Date = entries[nextStage];
        if (!enteredAt || !exitedAt) continue;
        const days = (exitedAt.getTime() - enteredAt.getTime()) / 86_400_000;
        if (days >= 0 && days < 180) {
          stageDurationAccum[stage] ??= [];
          stageDurationAccum[stage].push(days);
        }
      }
    }

    const personalAvg: Record<string, number> = {};
    for (const [stage, durations] of Object.entries(stageDurationAccum)) {
      personalAvg[stage] = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    }

    function avgDaysForStage(stage: JobStage): number {
      return personalAvg[stage] ?? BASELINE_DAYS[stage] ?? 7;
    }

    // ---- Build forecasts for active jobs ----
    const forecasts = jobs
      .filter((j) => !TERMINAL_STAGES.has(j.stage as JobStage))
      .map((job) => {
        const remaining = stagesAfter(job.stage as JobStage);
        const remainingDays = remaining.reduce(
          (sum, stage) => sum + avgDaysForStage(stage),
          0
        );

        const entries = stageEntryMap[job.id] ?? {};
        const currentStageEnteredAt: Date =
          entries[job.stage] ?? job.updatedAt;
        const daysInCurrentStage = Math.round(
          (Date.now() - currentStageEnteredAt.getTime()) / 86_400_000
        );
        const avgCurrentStageDays = avgDaysForStage(job.stage as JobStage);
        const remainingInCurrentStage = Math.max(
          0,
          avgCurrentStageDays - daysInCurrentStage
        );

        const totalRemainingDays = remainingInCurrentStage + remainingDays;
        const estimatedOfferDate = new Date(
          Date.now() + totalRemainingDays * 86_400_000
        );

        return {
          jobId: job.id,
          title: job.title,
          company: job.company,
          currentStage: job.stage,
          daysInCurrentStage,
          remainingStages: remaining.length,
          estimatedDaysToOffer: totalRemainingDays,
          estimatedOfferDate: estimatedOfferDate.toISOString().slice(0, 10),
          confidence: remaining.length <= 2 ? 'high' : remaining.length <= 4 ? 'medium' : 'low',
        };
      })
      .sort((a, b) => a.estimatedDaysToOffer - b.estimatedDaysToOffer);

    return NextResponse.json({
      forecasts,
      usedPersonalData: Object.keys(personalAvg).length > 0,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics/forecast] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
