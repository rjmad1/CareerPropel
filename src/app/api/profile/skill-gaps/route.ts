/**
 * POST /api/profile/skill-gaps
 * Runs a real Claude analysis to identify skill gaps between the candidate's
 * profile and the descriptions of their active jobs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const email = session.user.email;

    // Optional: caller may pass job descriptions directly; otherwise we fetch from DB
    let jobDescriptions: string[] = [];
    try {
      const body = await request.json();
      if (Array.isArray(body.jobDescriptions)) {
        jobDescriptions = body.jobDescriptions
          .filter((item: unknown): item is string => typeof item === 'string' && item.trim() !== '')
          .map((item: string) => item.trim());
      }
    } catch {
      // body is optional
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email },
      include: {
        skills: true,
        profileData: { where: { type: 'resume' }, take: 1 },
        jobs: {
          where: {
            stage: {
              in: ['interested', 'resume_tailoring', 'applied', 'recruiter_screen', 'hiring_manager'],
            },
          },
          select: { description: true, title: true, company: true },
          take: 10,
        },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Merge caller-supplied descriptions with active-job descriptions from DB
    const dbDescriptions = candidate.jobs
      .map((j) => `${j.title} at ${j.company}: ${j.description ?? ''}`)
      .filter((d) => d.trim().length > 10);
    const allDescriptions = [...jobDescriptions, ...dbDescriptions];

    if (allDescriptions.length === 0) {
      return NextResponse.json({
        missingSkills: [],
        gapLevel: 'low',
        recommendations: [],
      });
    }

    const profileSkills = candidate.skills.map((s) => s.name).join(', ') || 'None listed';
    const rawContent = candidate.profileData[0]?.content as Record<string, unknown> | null | undefined;
    let resumeText = 'Not available';
    if (rawContent != null) {
      resumeText = typeof rawContent.text === 'string' ? rawContent.text : JSON.stringify(rawContent);
    }

    const result = await callLLM(
      [
        {
          role: 'user',
          content: `Identify skill gaps between a candidate's profile and their target job descriptions.

## Candidate Skills
${profileSkills}

## Resume Summary
${resumeText.slice(0, 2000)}

## Target Job Descriptions
${allDescriptions.slice(0, 5).join('\n\n---\n\n').slice(0, 3000)}

Return ONLY valid JSON (no markdown fences):
{
  "missingSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "gapLevel": "low|medium|high",
  "recommendations": [
    "Specific, actionable recommendation 1",
    "Specific, actionable recommendation 2",
    "Specific, actionable recommendation 3"
  ]
}

missingSkills: top 5 skills in the JDs not found in the profile.
gapLevel: low (<30% gap), medium (30-60%), high (>60%).
recommendations: concrete steps to close the gaps.`,
        },
      ],
      {
        systemPrompt:
          'You are a career skills analyst. Identify genuine, specific skill gaps — not vague platitudes. Return valid JSON only.',
        maxTokens: 600,
        temperature: 0.3,
      }
    );

    const rawResponse = result.content.trim();
    const fenceMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = fenceMatch ? fenceMatch[1] : rawResponse;

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('[skill-gaps] Failed to parse LLM JSON:', jsonText.slice(0, 200));
      return NextResponse.json({ missingSkills: [], gapLevel: 'low', recommendations: [] });
    }

    return NextResponse.json({
      missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills.slice(0, 5) : [],
      gapLevel: ['low', 'medium', 'high'].includes(parsed.gapLevel as string) ? parsed.gapLevel : 'low',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [],
    });
  } catch (error) {
    console.error('[skill-gaps] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
