import { NextRequest, NextResponse } from 'next/server';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/profile/ats-check
 * Analyze resume for ATS optimization
 */
export async function POST(request: NextRequest) {
  try {
    const { resumeContent } = await request.json();

    if (!resumeContent) {
      return NextResponse.json(
        { error: 'resumeContent is required' },
        { status: 400 }
      );
    }

    // TODO: Integrate Claude API for ATS analysis
    // const analysis = await analyzeResumeWithClaude(resumeContent);

    // Mock response
    const hasMetrics = resumeContent.includes('%') || resumeContent.includes('$');
    const hasActionVerbs = resumeContent.match(/^(Led|Designed|Implemented|Built|Created|Managed)/m);

    const score = Math.round(
      (hasMetrics ? 20 : 0) + (hasActionVerbs ? 20 : 0) + 40
    );

    const suggestions = [
      !hasMetrics && {
        category: 'Metrics',
        issue: 'Missing quantifiable results',
        suggestion: 'Add percentages, dollar amounts, or timeframes to achievements',
        priority: 'high',
      },
      !hasActionVerbs && {
        category: 'Action Verbs',
        issue: 'Weak verbs in descriptions',
        suggestion: 'Start bullet points with strong action verbs (Led, Designed, Implemented)',
        priority: 'medium',
      },
      {
        category: 'Keywords',
        issue: 'Limited industry keywords',
        suggestion: 'Include more keywords from target job descriptions',
        priority: 'medium',
      },
    ].filter(Boolean);

    return NextResponse.json(
      {
        score,
        suggestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error analyzing resume:', error);
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    );
  }
}
