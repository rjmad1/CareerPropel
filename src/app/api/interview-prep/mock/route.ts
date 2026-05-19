/**
 * Mock Interview Routes
 *
 * POST /api/interview-prep/mock/feedback - Generate AI feedback on mock interview responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { errorResponse } from '@/lib/utils/apiResponse';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

interface FeedbackRequest {
  sessionId: string;
  responses: Array<[string, string]>;
  prep?: any;
}

interface FeedbackResponse {
  sessionId: string;
  feedback: string;
  scores: {
    clarity: number;
    relevance: number;
    completeness: number;
    overall: number;
  };
  suggestions: string[];
  strengths: string[];
  areasForImprovement: string[];
}

/**
 * POST /api/interview-prep/mock/feedback
 * Generate AI feedback on mock interview responses
 */
export async function POST(request: NextRequest) {
  try {
    await getAuthContext();

    const body: FeedbackRequest = await request.json();

    if (!body.sessionId || !body.responses || body.responses.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and responses are required' },
        { status: 400 }
      );
    }

    // AI feedback is served by the /mock/feedback sub-route.
    // This route returns a placeholder for direct /mock requests.

    // Placeholder response
    const feedback: FeedbackResponse = {
      sessionId: body.sessionId,
      feedback:
        'Your responses were clear and structured. You provided specific examples and demonstrated problem-solving skills.',
      scores: {
        clarity: 8.5,
        relevance: 8.0,
        completeness: 7.5,
        overall: 8.0,
      },
      suggestions: [
        'Use more quantifiable metrics to measure impact',
        'Practice concise storytelling - aim for 2 minutes per answer',
        'Prepare specific examples for each competency',
      ],
      strengths: [
        'Clear communication',
        'Strong technical understanding',
        'Structured STAR responses',
      ],
      areasForImprovement: [
        'Adding more business impact metrics',
        'Connecting technical solutions to business outcomes',
      ],
    };

    return NextResponse.json(feedback);
  } catch (error) {
    if ((error as any)?.statusCode === 401) {
      return errorResponse(error);
    }
    console.error('Error generating interview feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
