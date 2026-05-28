/**
 * POST /api/interview-prep/mock
 * Generates AI feedback on mock interview responses and persists the session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callLLM } from '@/lib/llm/provider';
import { prisma } from '@/lib/db';
import { refinePrepFromSessions } from '@/lib/interviews/prepRefinementService';

export const dynamic = 'force-dynamic';

interface FeedbackRequest {
  sessionId: string;
  responses: Array<[string, string]>;
  questions?: Array<{ id: string; text: string; category: string }>;
  jobId?: string;
  prep?: Record<string, unknown>;
}

interface FeedbackResponse {
  sessionId: string;
  feedback: string;
  scores: { clarity: number; relevance: number; completeness: number; overall: number };
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
  persistedId?: string;
  fallbackUsed?: boolean;
  errorDetail?: string;
}

export async function POST(request: NextRequest) {
  let body: FeedbackRequest = { sessionId: 'unknown', responses: [] };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    body = await request.json();

    if (!body.sessionId || !body.responses || body.responses.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and responses are required' },
        { status: 400 }
      );
    }

    const responseText = body.responses
      .map(([id, answer], i) => {
        const q = body.questions?.find((q) => q.id === id);
        const questionHint = q ? ` (${q.text})` : '';
        return `Q${i + 1}${questionHint}: ${answer || '[No answer provided]'}`;
      })
      .join('\n\n');

    const result = await callLLM(
      [
        {
          role: 'user',
          content: `Evaluate these mock interview responses and provide structured coaching feedback.

## Responses
${responseText}

Return ONLY valid JSON (no markdown fences):
{
  "feedback": "2-3 sentence overall assessment",
  "scores": {
    "clarity": 8.5,
    "relevance": 8,
    "completeness": 7.5,
    "overall": 8
  },
  "strengths": ["specific strength 1", "specific strength 2", "specific strength 3"],
  "areasForImprovement": ["specific area 1", "specific area 2"],
  "suggestions": [
    "Actionable improvement tip 1",
    "Actionable improvement tip 2",
    "Actionable improvement tip 3"
  ]
}

Scores are out of 10. Be specific and reference the actual responses.`,
        },
      ],
      {
        systemPrompt:
          'You are a senior interview coach providing specific, actionable feedback. Return valid JSON only.',
        maxTokens: 1500,
        temperature: 0.6,
      }
    );

    const rawContent = result.content.trim();
    const fenceMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let jsonText: string;
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    } else {
      const first = rawContent.indexOf('{');
      const last = rawContent.lastIndexOf('}');
      jsonText = first !== -1 && last !== -1 ? rawContent.slice(first, last + 1) : rawContent;
    }

    const parsed = JSON.parse(jsonText);

    const feedback: FeedbackResponse = {
      sessionId: body.sessionId,
      feedback: parsed.feedback,
      scores: parsed.scores,
      suggestions: parsed.suggestions ?? [],
      strengths: parsed.strengths ?? [],
      areasForImprovement: parsed.areasForImprovement ?? [],
    };

    // Persist session non-fatally — a DB error must not block the response
    try {
      const candidate = await prisma.candidate.findUnique({
        where: { email },
        select: { id: true },
      });
      if (candidate) {
        // Validate job ownership before persisting to avoid orphaned FK references
        let validatedJobId: string | null = null;
        if (body.jobId) {
          const ownedJob = await prisma.job.findFirst({
            where: { id: body.jobId, candidateId: candidate.id },
            select: { id: true },
          });
          validatedJobId = ownedJob?.id ?? null;
        }

        const persisted = await prisma.mockInterviewSession.create({
          data: {
            candidateId: candidate.id,
            jobId: validatedJobId,
            sessionId: body.sessionId,
            questions: (body.questions ?? []) as import('@prisma/client').Prisma.InputJsonValue,
            responses: body.responses as import('@prisma/client').Prisma.InputJsonValue,
            feedback: feedback.feedback,
            scores: feedback.scores as import('@prisma/client').Prisma.InputJsonValue,
            strengths: feedback.strengths,
            areasForImprovement: feedback.areasForImprovement,
            suggestions: feedback.suggestions,
          },
          select: { id: true },
        });
        feedback.persistedId = persisted.id;

        // Async refinement — fire-and-forget so it never delays the response
        if (validatedJobId) {
          refinePrepFromSessions(candidate.id, validatedJobId).catch((e) =>
            console.error('[mock] Prep refinement failed:', e)
          );
        }
      }
    } catch (persistErr) {
      console.error('[mock] Failed to persist session:', persistErr);
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('[mock] Error generating interview feedback:', error);

    const fallback: FeedbackResponse = {
      sessionId: body.sessionId,
      feedback:
        'Your responses showed strong communication skills. Focus on adding more quantifiable outcomes.',
      scores: { clarity: 7.5, relevance: 7.5, completeness: 7, overall: 7.5 },
      suggestions: [
        'Use the STAR framework (Situation, Task, Action, Result) for every answer',
        'Add quantifiable metrics to demonstrate impact (e.g., "reduced load time by 40%")',
        'Keep answers concise — aim for 90-120 seconds per question',
      ],
      strengths: ['Clear communication', 'Structured thinking'],
      areasForImprovement: ['Add more specific metrics', 'Connect solutions to business outcomes'],
      fallbackUsed: true,
      errorDetail: error instanceof Error ? error.message : 'Unknown error',
    };
    return NextResponse.json(fallback);
  }
}
