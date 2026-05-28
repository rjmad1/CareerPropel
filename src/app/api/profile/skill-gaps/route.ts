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

    // 1. Layer 1: Deterministic Skill Inventory Comparison
    const candidateSkillsLower = candidate.skills.map((s) => s.name.toLowerCase());
    
    // Clean up JDs text to extract key tech terms
    const jdWords = allDescriptions.join(' ').toLowerCase().split(/[^a-zA-Z0-9#\-\.+]/).filter(w => w.length > 2);
    const standardSkillsDict = [
      'react', 'typescript', 'next.js', 'nextjs', 'node.js', 'nodejs', 'graphql', 'postgresql', 
      'prisma', 'aws', 'docker', 'kubernetes', 'python', 'go', 'rust', 'system design', 
      'agile', 'scrum', 'ci/cd', 'terraform', 'redis', 'tailwindcss', 'jest', 'cypress'
    ];
    
    const jdSkills = Array.from(new Set(jdWords.filter(w => standardSkillsDict.includes(w))));
    const deterministicMissing = jdSkills.filter(s => !candidateSkillsLower.includes(s));
    
    // Normalize casing for display
    const normalizedMissing = deterministicMissing.map(s => {
      if (s === 'nextjs' || s === 'next.js') return 'Next.js';
      if (s === 'nodejs' || s === 'node.js') return 'Node.js';
      if (s === 'postgresql') return 'PostgreSQL';
      if (s === 'tailwindcss') return 'Tailwind CSS';
      if (s === 'redis') return 'Redis';
      if (s === 'aws') return 'AWS';
      if (s === 'graphql') return 'GraphQL';
      return s.charAt(0).toUpperCase() + s.slice(1);
    });

    const gapPercent = normalizedMissing.length / Math.max(jdSkills.length, 1);
    const deterministicGapLevel = gapPercent > 0.5 ? 'high' : gapPercent > 0.25 ? 'medium' : 'low';

    const profileSkills = candidate.skills.map((s) => s.name).join(', ') || 'None listed';
    const rawContent = candidate.profileData[0]?.content as Record<string, unknown> | null | undefined;
    let resumeText = 'Not available';
    if (rawContent != null) {
      resumeText = typeof rawContent.text === 'string' ? rawContent.text : JSON.stringify(rawContent);
    }

    // 2. Layer 2: Best-Effort AI Gap Prioritization
    try {
      const result = await callLLM(
        [
          {
            role: 'user',
            content: `Identify and prioritize skill gaps between a candidate's profile and their target job descriptions.
  
  ## Candidate Skills
  ${profileSkills}
  
  ## Resume Summary
  ${resumeText.slice(0, 2000)}
  
  ## Deterministically Missing Core Skills
  ${normalizedMissing.join(', ')}
  
  ## Target Job Descriptions
  ${allDescriptions.slice(0, 5).join('\n\n---\n\n').slice(0, 3000)}
  
  Return ONLY valid JSON (no markdown fences):
  {
    "prioritizedMissingSkills": ["skill1", "skill2", "skill3"],
    "recommendations": [
      "Specific, actionable learning recommendation 1",
      "Specific, actionable recommendation 2",
      "Specific, actionable recommendation 3"
    ]
  }
  
  prioritizedMissingSkills: the top 5 highest value skills to learn next, ordered by priority.
  recommendations: concrete professional actions/courses to close these gaps.`,
          },
        ],
        {
          systemPrompt:
            'You are a career skills analyst. Prioritize core gaps and write high-impact learning strategies. Return valid JSON only.',
          maxTokens: 600,
          temperature: 0.3,
        }
      );

      const rawResponse = result.content.trim();
      const fenceMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = fenceMatch ? fenceMatch[1] : rawResponse;
      const parsed = JSON.parse(jsonText);

      return NextResponse.json({
        missingSkills: Array.isArray(parsed.prioritizedMissingSkills)
          ? parsed.prioritizedMissingSkills.slice(0, 5)
          : normalizedMissing.slice(0, 5),
        gapLevel: deterministicGapLevel,
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 3) : [],
        source: 'ai',
        confidence: 'high'
      });
    } catch (aiErr) {
      console.warn('[skill-gaps] AI prioritization failed. Activating degraded mode fallback:', aiErr);
      
      // Fallback: fail-open gracefully to Layer 1 deterministic baseline with fallback recommendations
      const defaultRecommendations = normalizedMissing.slice(0, 3).map((skill) => (
        `Review resources and build a sandbox project demonstrating your ${skill} capability.`
      ));

      if (defaultRecommendations.length === 0) {
        defaultRecommendations.push('Add target job descriptions to identify structural skill gaps.');
      }

      return NextResponse.json({
        missingSkills: normalizedMissing.slice(0, 5),
        gapLevel: deterministicGapLevel,
        recommendations: defaultRecommendations,
        source: 'fallback',
        confidence: 'low',
        reason: 'AI prioritization service offline. Displaying local deterministic catalog gaps.'
      });
    }
  } catch (error) {
    console.error('[skill-gaps] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
