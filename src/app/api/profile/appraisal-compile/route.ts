import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';
import { callLLM } from '@/lib/llm/provider';

export const dynamic = 'force-dynamic';

/**
 * GET /api/profile/appraisal-compile
 * Returns all past AppraisalSession records for the logged-in candidate.
 */
export async function GET(_request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const sessions = await prisma.appraisalSession.findMany({
      where: { candidateId: candidate.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appraisal sessions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/profile/appraisal-compile
 * Takes a list of staged accomplishment IDs and compiles them into a comprehensive
 * performance appraisal self-evaluation or a promotion business case.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, title, type } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Staged accomplishment IDs are required' },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true, name: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Fetch achievements staged by user
    const achievements = await prisma.accomplishment.findMany({
      where: {
        id: { in: ids },
        candidateId: candidate.id,
      },
      orderBy: { date: 'desc' },
    });

    if (achievements.length === 0) {
      return NextResponse.json({ error: 'No matching accomplishments found' }, { status: 404 });
    }

    // Compile into Markdown representation
    const achievementsList = achievements
      .map((a, idx) => {
        return `[Achievement #${idx + 1}]
Title: ${a.title}
Date: ${a.date.toDateString()}
Category: ${a.category}
Metrics: ${a.metrics || 'Not specified'}
STAR Context: ${a.starContext || 'Not specified'}
Description: ${a.description}
`;
      })
      .join('\n\n');

    const systemPrompt = "You are a Chief People Officer and Executive Director of Talent Management at an elite technology company.";

    const userPrompt = `Given the following professional milestones logged by candidate ${candidate.name}, compile them into a highly cohesive, persuasive, and professional ${
      type === 'promotion' ? 'Promotion Business Case' : 'Annual Performance Self-Evaluation Review'
    }.

Title of Evaluation: ${title || 'Annual Performance Appraisal'}
Type: ${type === 'promotion' ? 'Promotion Case (Engineering L5/L6)' : 'Self-Appraisal'}

Staged Professional Accomplishments:
${achievementsList}

Please organize the narrative into the following clear professional sections using elegant Markdown:
1. **Executive Summary**: A powerful, high-impact summary of ${candidate.name}'s performance, trajectory, and core value delivered during this cycle.
2. **Core Competency Performance**:
   - **Technical Mastery & Innovation** (Map relevant achievements here)
   - **Execution & Scope of Impact** (Highlight primary quantified metrics and business value)
   - **Collaboration, Mentorship & Leadership** (Highlight team culture, growth, and cross-functional contributions)
3. **Continuous Growth & Opportunity Gaps**: Areas where ${candidate.name} is looking to grow further in the upcoming cycle.
4. ${
      type === 'promotion'
        ? '**Business Case for Promotion**: A clear, justification-heavy case highlighting why these achievements warrant immediate promotion to the next technical tier.'
        : '**Self-Rating & Career Trajectory**: Reflection on goals and future milestones.'
    }

Use professional corporate vocabulary (sustainable growth, velocity, scope, cross-functional impact, systemic scaling, operational excellent, metric-driven). Ensure EVERY single metric from the staged accomplishments is preserved and highlighted in bold!`;

    const result = await callLLM([
      { role: 'user', content: userPrompt }
    ], {
      systemPrompt,
      temperature: 0.5,
    });

    // Save this compiled session to the database
    const session = await prisma.appraisalSession.create({
      data: {
        candidateId: candidate.id,
        title: title || 'Annual Appraisal Compilation',
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Approximate H1 range
        endDate: new Date(),
        status: 'compiled',
        selfReview: result.content,
        impactDraft: type === 'promotion' ? result.content : null,
      },
    });

    return NextResponse.json({ success: true, content: result.content, session }, { status: 200 });
  } catch (error) {
    console.error('Error compiling appraisal:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
