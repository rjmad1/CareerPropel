/**
 * GET /api/analytics/pipeline
 *
 * Computes pipeline conversion rates for the authenticated candidate:
 * - Jobs per stage
 * - Stage-to-stage conversion rates
 * - Average time in stage
 * - AI-generated insights via the analytics agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { PIPELINE_STAGES, JobStage } from '@/types/job';

export const dynamic = 'force-dynamic';

interface StageStats {
  stage: JobStage;
  count: number;
  avgDaysInStage: number;
  conversionRate: number | null; // % that progressed to next stage
}

async function computeStageStats(candidateId: string): Promise<StageStats[]> {
  const [jobs, activities] = await Promise.all([
    prisma.job.findMany({
      where: { candidateId },
      select: { id: true, stage: true, createdAt: true, updatedAt: true },
    }),
    prisma.jobActivity.findMany({
      where: { jobId: { in: [] }, action: 'stage_changed' },
      select: { jobId: true, metadata: true, createdAt: true },
    }),
  ]);

  const jobIds = jobs.map((j) => j.id);
  const stageActivities = jobIds.length > 0
    ? await prisma.jobActivity.findMany({
        where: { jobId: { in: jobIds }, action: 'stage_changed' },
        select: { jobId: true, metadata: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
    : activities;

  // Build per-job stage-entry timestamps from activity history
  const stageEntryByJob: Record<string, Record<string, Date>> = {};
  for (const act of stageActivities) {
    const meta = act.metadata as { from?: string; to?: string } | null;
    if (!meta?.to) continue;
    stageEntryByJob[act.jobId] ??= {};
    stageEntryByJob[act.jobId][meta.to] = act.createdAt;
  }

  // Accumulate durations per stage across all jobs
  const durationSumByStage: Record<string, number> = {};
  const durationCountByStage: Record<string, number> = {};
  for (const stage of PIPELINE_STAGES) {
    durationSumByStage[stage] = 0;
    durationCountByStage[stage] = 0;
  }

  for (const job of jobs) {
    const entries = stageEntryByJob[job.id] ?? {};
    for (let i = 0; i < PIPELINE_STAGES.length; i++) {
      const stage = PIPELINE_STAGES[i];
      const enteredAt: Date = entries[stage] ?? (stage === PIPELINE_STAGES[0] ? job.createdAt : null as unknown as Date);
      if (!enteredAt) continue;
      const nextStage = PIPELINE_STAGES[i + 1];
      const exitedAt: Date | null = nextStage ? (entries[nextStage] ?? null) : null;
      if (exitedAt) {
        const days = (exitedAt.getTime() - enteredAt.getTime()) / 86_400_000;
        durationSumByStage[stage] += days;
        durationCountByStage[stage] += 1;
      }
    }
  }

  const countByStage: Record<string, number> = {};
  for (const stage of PIPELINE_STAGES) countByStage[stage] = 0;
  for (const job of jobs) countByStage[job.stage] = (countByStage[job.stage] || 0) + 1;

  const stats: StageStats[] = PIPELINE_STAGES.map((stage, i) => {
    const count = countByStage[stage] || 0;
    const nextStage = PIPELINE_STAGES[i + 1];
    const nextCount = nextStage ? (countByStage[nextStage] || 0) : null;
    const conversionRate =
      count > 0 && nextCount !== null ? Math.round((nextCount / count) * 100) : null;
    const n = durationCountByStage[stage];
    const avgDaysInStage = n > 0 ? Math.round(durationSumByStage[stage] / n) : 0;

    return { stage, count, avgDaysInStage, conversionRate };
  });

  return stats;
}

async function generateInsights(stats: StageStats[], totalJobs: number): Promise<string> {
  if (totalJobs === 0) return 'No jobs in pipeline yet. Start adding opportunities!';

  const summaryLines = stats
    .filter((s) => s.count > 0)
    .map(
      (s) =>
        `${s.stage.replace(/_/g, ' ')}: ${s.count} jobs${s.conversionRate !== null ? `, ${s.conversionRate}% advance` : ''}`
    )
    .join('\n');

  const result = await callLLM(
    [
      {
        role: 'user',
        content: `Analyse this job application pipeline and provide 2-3 concrete, actionable insights.

## Pipeline Data
Total jobs: ${totalJobs}
${summaryLines}

Return ONLY valid JSON:
{
  "insights": [
    "Specific insight 1 with recommendation",
    "Specific insight 2 with recommendation",
    "Specific insight 3 with recommendation"
  ],
  "overallHealth": "healthy|needs_attention|critical",
  "topRecommendation": "Single most important action to take now"
}`,
      },
    ],
    {
      systemPrompt:
        'You are a career analytics AI. Give specific, data-driven insights — not generic advice. Return valid JSON only.',
      maxTokens: 500,
      temperature: 0.4,
    }
  );

  try {
    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    return jsonText; // Return raw JSON — caller parses it
  } catch {
    return JSON.stringify({ insights: [], overallHealth: 'needs_attention', topRecommendation: '' });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    const candidate = await prisma.candidate.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const stats = await computeStageStats(candidate.id);
    const totalJobs = stats.reduce((sum, s) => sum + s.count, 0);

    // Only call LLM if there's meaningful data; skip for empty pipelines
    const skipInsights = request.nextUrl.searchParams.get('insights') === 'false';
    let insightsRaw: string | null = null;
    if (!skipInsights && totalJobs > 0) {
      insightsRaw = await generateInsights(stats, totalJobs);
    }

    let insights: {
      insights: string[];
      overallHealth: string;
      topRecommendation: string;
    } | null = null;

    if (insightsRaw) {
      try {
        insights = JSON.parse(insightsRaw);
      } catch {
        insights = null;
      }
    }

    return NextResponse.json({
      totalJobs,
      stats,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[pipeline analytics] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
