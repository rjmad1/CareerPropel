import { NextRequest, NextResponse } from 'next/server';

// Mark as dynamic to prevent build-time static generation
export const dynamic = 'force-dynamic'

/**
 * POST /api/profile/narrative
 * Generate AI career narrative
 */
export async function POST(_request: NextRequest) {
  try {
    // const { candidateId, focusAreas } = await request.json();

    // TODO: Integrate Claude API for narrative generation
    // const narrative = await generateNarrativeWithClaude(candidateId, focusAreas);

    // Mock response
    const mockNarrative = `Results-driven software engineer with 5+ years of experience building scalable web applications. 
    Specialized in React and Node.js, with a proven track record of delivering high-impact projects that improved 
    system performance by up to 50%. Strong collaborator who thrives in agile environments and enjoys mentoring 
    junior developers. Passionate about clean code, continuous learning, and solving complex technical challenges.`;

    return NextResponse.json(
      { narrative: mockNarrative },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating narrative:', error);
    return NextResponse.json(
      { error: 'Failed to generate narrative' },
      { status: 500 }
    );
  }
}
