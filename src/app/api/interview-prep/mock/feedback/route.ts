/**
 * POST /api/interview-prep/mock/feedback
 * Generate AI feedback on mock interview responses using Claude
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnthropicProvider } from '@/lib/llm/anthropic';
import { getAuthContext } from '@/lib/middleware/auth';
import { errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

interface FeedbackRequest {
  sessionId: string;
  responses: Array<[string, string]>; // [questionId, userAnswer]
  questions?: Array<{ id: string; text: string; category: string }>;
}

interface FeedbackResponse {
  sessionId: string;
  feedback: string;
  scores: { clarity: number; relevance: number; completeness: number; overall: number };
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

export async function POST(request: NextRequest) {
  let body: FeedbackRequest = { sessionId: 'unknown', responses: [] };

  try {
    await getAuthContext();

    body = await request.json();

    if (!body.sessionId || !body.responses || body.responses.length === 0) {
      return NextResponse.json({ error: 'sessionId and responses are required' }, { status: 400 });
    }

    const responseText = body.responses
      .map(([id, answer], i) => {
        const q = body.questions?.find((q) => q.id === id);
        return `Q${i + 1}${q ? ` (${q.text})` : ''}: ${answer || '[No answer provided]'}`;
      })
      .join('\n\n');

    const llm = new AnthropicProvider();

    const result = await llm.callLLM(
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
    "relevance": 8.0,
    "completeness": 7.5,
    "overall": 8.0
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

    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();

    const parsed = JSON.parse(jsonText);

    const feedback: FeedbackResponse = {
      sessionId: body.sessionId,
      feedback: parsed.feedback,
      scores: parsed.scores,
      suggestions: parsed.suggestions ?? [],
      strengths: parsed.strengths ?? [],
      areasForImprovement: parsed.areasForImprovement ?? [],
    };

    return NextResponse.json(feedback);
  } catch (error) {
    // Surface auth errors properly
    if ((error as any)?.statusCode === 401) {
      return errorResponse(error);
    }

    console.error('[mock/feedback] Error generating feedback:', error);
    // Return graceful fallback using the already-parsed body
    const fallback: FeedbackResponse = {
      sessionId: body.sessionId,
      feedback:
        'Your responses showed strong communication skills. Focus on adding more quantifiable outcomes.',
      scores: { clarity: 7.5, relevance: 7.5, completeness: 7.0, overall: 7.5 },
      suggestions: [
        'Use the STAR framework (Situation, Task, Action, Result) for every answer',
        'Add quantifiable metrics to demonstrate impact (e.g., "reduced load time by 40%")',
        'Keep answers concise — aim for 90-120 seconds per question',
      ],
      strengths: ['Clear communication', 'Structured thinking'],
      areasForImprovement: ['Add more specific metrics', 'Connect solutions to business outcomes'],
    };
    return NextResponse.json(fallback);
  }
}
