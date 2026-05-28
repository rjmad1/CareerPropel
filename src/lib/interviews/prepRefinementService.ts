/**
 * prepRefinementService
 *
 * Analyses a candidate's mock interview session history and updates the
 * InterviewPrep record with an adaptive readiness score + targeted coaching
 * notes so future prep material reflects actual performance gaps.
 */

import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';

interface SessionSummary {
  completedAt: Date;
  overall: number;
  clarity: number;
  relevance: number;
  completeness: number;
  strengths: string[];
  areasForImprovement: string[];
}

/**
 * Pull the last N mock sessions for a candidate+job and return a compact
 * summary suitable for feeding to the LLM.
 */
async function loadRecentSessions(
  candidateId: string,
  jobId: string,
  limit = 5
): Promise<SessionSummary[]> {
  const rows = await prisma.mockInterviewSession.findMany({
    where: { candidateId, jobId },
    orderBy: { completedAt: 'desc' },
    take: limit,
    select: {
      completedAt: true,
      scores: true,
      strengths: true,
      areasForImprovement: true,
    },
  });

  return rows.map((r) => {
    const s = (r.scores as Record<string, number> | null) ?? {};
    return {
      completedAt: r.completedAt,
      overall: s.overall ?? 0,
      clarity: s.clarity ?? 0,
      relevance: s.relevance ?? 0,
      completeness: s.completeness ?? 0,
      strengths: r.strengths,
      areasForImprovement: r.areasForImprovement,
    };
  });
}

/**
 * Compute an adaptive readiness score (0–100) from session history.
 * Weights recent sessions more heavily (exponential decay).
 */
function computeReadinessScore(sessions: SessionSummary[]): number {
  if (sessions.length === 0) return 0;

  let weightedSum = 0;
  let weightTotal = 0;
  sessions.forEach((s, i) => {
    // Most recent = index 0 (highest weight)
    const weight = Math.pow(0.7, i);
    weightedSum += s.overall * weight;
    weightTotal += weight;
  });

  const raw = weightTotal > 0 ? weightedSum / weightTotal : 0;
  // Scale from 0–10 to 0–100
  return Math.min(Math.round(raw * 10), 100);
}

interface RefinementResult {
  readinessScore: number;
  coachingNotes: string;
  focusAreas: string[];
}

/**
 * Ask Claude to synthesise session history into targeted coaching notes.
 */
async function generateCoachingNotes(
  sessions: SessionSummary[]
): Promise<{ coachingNotes: string; focusAreas: string[] }> {
  if (sessions.length === 0) {
    return { coachingNotes: 'No sessions recorded yet.', focusAreas: [] };
  }

  const sessionText = sessions
    .map(
      (s, i) =>
        `Session ${i + 1} (${s.completedAt.toISOString().slice(0, 10)}):
  Scores — overall ${s.overall}/10, clarity ${s.clarity}/10, relevance ${s.relevance}/10, completeness ${s.completeness}/10
  Strengths: ${s.strengths.join('; ') || 'none listed'}
  Gaps: ${s.areasForImprovement.join('; ') || 'none listed'}`
    )
    .join('\n\n');

  const result = await callLLM(
    [
      {
        role: 'user',
        content: `Analyse these mock interview sessions and produce targeted coaching guidance.

## Sessions (most recent first)
${sessionText}

Return ONLY valid JSON:
{
  "coachingNotes": "2-3 sentence coaching summary that identifies the primary pattern in performance",
  "focusAreas": ["Most critical area to improve", "Second most critical area", "Third area"]
}`,
      },
    ],
    {
      systemPrompt:
        'You are a senior interview coach. Identify patterns across sessions, not just the latest one. Return valid JSON only.',
      maxTokens: 500,
      temperature: 0.4,
    }
  );

  const rawContent = result.content.trim();
  const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const jsonText = fenceMatch ? fenceMatch[1] : rawContent;

  try {
    const parsed = JSON.parse(jsonText);
    return {
      coachingNotes: typeof parsed.coachingNotes === 'string' ? parsed.coachingNotes : '',
      focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas.slice(0, 3) : [],
    };
  } catch {
    console.warn('[prepRefinement] Failed to parse coaching notes JSON:', jsonText.slice(0, 200));
    return { coachingNotes: 'Unable to generate coaching notes at this time.', focusAreas: [] };
  }
}

/**
 * Main entry point: run after a mock session is persisted to update the
 * InterviewPrep record with the latest readiness score + coaching notes.
 */
export async function refinePrepFromSessions(
  candidateId: string,
  jobId: string
): Promise<RefinementResult> {
  const sessions = await loadRecentSessions(candidateId, jobId);
  const readinessScore = computeReadinessScore(sessions);
  const { coachingNotes, focusAreas } = await generateCoachingNotes(sessions);

  // Update the InterviewPrep record if one exists for this job
  const prep = await prisma.interviewPrep.findUnique({ where: { jobId } });
  if (prep) {
    await prisma.interviewPrep.update({
      where: { jobId },
      data: {
        confidenceScore: readinessScore / 100,
        // Merge coaching notes into resumeAlignment JSON as a coaching field
        resumeAlignment: {
          ...(typeof prep.resumeAlignment === 'object' && !Array.isArray(prep.resumeAlignment) && prep.resumeAlignment !== null
            ? (prep.resumeAlignment as Record<string, unknown>)
            : {}),
          coachingNotes,
          focusAreas,
          readinessScore,
          refinedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      },
    });
  }

  return { readinessScore, coachingNotes, focusAreas };
}
