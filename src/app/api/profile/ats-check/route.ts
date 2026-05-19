import { NextRequest, NextResponse } from 'next/server';
import { AnthropicProvider } from '@/lib/llm/anthropic';
import { getAuthContext } from '@/lib/middleware/auth';
import { errorResponse } from '@/lib/utils/apiResponse';

export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/ats-check
 * Analyze resume for ATS optimization using Claude
 */
export async function POST(request: NextRequest) {
  let resumeContent = '';
  let jobDescription = '';

  try {
    await getAuthContext();

    const body = await request.json();
    resumeContent = body.resumeContent ?? '';
    jobDescription = body.jobDescription ?? '';

    if (!resumeContent) {
      return NextResponse.json({ error: 'resumeContent is required' }, { status: 400 });
    }

    const llm = new AnthropicProvider();

    const result = await llm.callLLM(
      [
        {
          role: 'user',
          content: `Analyze this resume for ATS (Applicant Tracking System) optimization and provide a score with actionable suggestions.

## Resume
${resumeContent.slice(0, 4000)}

${jobDescription ? `## Target Job Description\n${jobDescription.slice(0, 2000)}` : ''}

Return ONLY valid JSON (no markdown fences):
{
  "score": 78,
  "breakdown": {
    "keywords": 75,
    "formatting": 85,
    "metrics": 60,
    "actionVerbs": 80,
    "sections": 90
  },
  "suggestions": [
    {
      "category": "Keywords",
      "issue": "Missing key technical terms",
      "suggestion": "Add relevant keywords from job description such as...",
      "priority": "high",
      "example": "Before: 'Built web apps' → After: 'Developed React/TypeScript web applications'"
    }
  ],
  "strengths": ["string"],
  "keywords": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "summary": "One-sentence overall assessment"
}

Score rules: 0-100 where 90+ = ATS-optimized, 70-89 = good, 50-69 = needs work, <50 = significant gaps.
Provide 3-6 specific, actionable suggestions ordered by priority (high/medium/low).
${jobDescription ? 'Compare keywords in the resume against the job description.' : 'Analyze for general ATS best practices.'}`,
        },
      ],
      {
        systemPrompt:
          'You are an expert ATS optimization specialist. Return valid JSON only with no markdown.',
        maxTokens: 2000,
        temperature: 0.4,
      }
    );

    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    const analysis = JSON.parse(jsonText);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    // If this is an auth error, surface it properly
    if ((error as any)?.statusCode === 401) {
      return errorResponse(error);
    }

    console.error('[ats-check] Error:', error);

    // Graceful fallback with basic heuristics using the already-parsed body
    const hasMetrics = /\d+%|\$[\d,]+|\d+x\s/i.test(resumeContent);
    const hasActionVerbs =
      /\b(led|designed|implemented|built|created|managed|developed|delivered|launched|increased|reduced|improved|architected|scaled|drove)\b/i.test(
        resumeContent
      );
    const hasContact = /@|linkedin\.com|github\.com/i.test(resumeContent);

    const score = (hasMetrics ? 25 : 0) + (hasActionVerbs ? 25 : 0) + (hasContact ? 10 : 0) + 30;

    return NextResponse.json(
      {
        score,
        breakdown: { keywords: score - 5, formatting: score, metrics: hasMetrics ? 80 : 40, actionVerbs: hasActionVerbs ? 85 : 45, sections: 75 },
        suggestions: [
          !hasMetrics && {
            category: 'Metrics',
            issue: 'Missing quantifiable results',
            suggestion: 'Add percentages, dollar amounts, or timeframes to achievements',
            priority: 'high',
            example: 'Before: "Improved performance" → After: "Improved API response time by 40%"',
          },
          !hasActionVerbs && {
            category: 'Action Verbs',
            issue: 'Weak bullet point openers',
            suggestion: 'Start each bullet with a strong action verb',
            priority: 'medium',
            example: 'Led, Designed, Implemented, Delivered, Architected',
          },
          { category: 'Keywords', issue: 'Match keywords to job description', suggestion: 'Include specific technologies and skills from job postings', priority: 'medium', example: '' },
        ].filter(Boolean),
        strengths: ['Resume submitted for analysis'],
        keywords: { found: [], missing: [] },
        summary: 'Basic heuristic analysis (AI unavailable). Review suggestions to improve your score.',
      },
      { status: 200 }
    );
  }
}
