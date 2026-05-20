import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm/provider';
import { prisma } from '@/lib/db';
import { getAuthContext } from '@/lib/middleware/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/narrative
 * Generate a personalized AI career narrative using Claude
 */
export async function POST(request: NextRequest) {
  try {
    const { focusAreas, tone, targetRole } = await request.json();

    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      include: {
        skills: true,
        achievements: true,
        profileEntities: { where: { type: { in: ['experience', 'education'] } }, take: 10 },
        profileData: { where: { type: 'resume' }, take: 1 },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate profile not found' }, { status: 404 });
    }

    const experiences = candidate.profileEntities.filter((e) => e.type === 'experience');
    const educations = candidate.profileEntities.filter((e) => e.type === 'education');

    const experienceText = experiences
      .slice(0, 5)
      .map((e) => {
        const d = e.data as any;
        return `${d.title ?? 'Role'} at ${d.company ?? 'Company'} (${d.startYear ?? ''}–${d.endYear ?? 'Present'}): ${d.description ?? ''}`;
      })
      .join('\n');

    const educationText = educations
      .map((e) => {
        const d = e.data as any;
        return `${d.degree ?? 'Degree'} from ${d.institution ?? 'Institution'}`;
      })
      .join('; ');

    const skillsText = candidate.skills.map((s) => s.name).join(', ');

    const achievementsText = candidate.achievements
      .slice(0, 5)
      .map((a) => `${a.title}: ${a.description}`)
      .join('\n');

    const result = await callLLM(
      [
        {
          role: 'user',
          content: `Write a compelling career narrative for this professional.

## Professional Background
Name: ${candidate.name}
Summary: ${candidate.summary ?? 'Experienced professional'}
Skills: ${skillsText || 'Not specified'}
Education: ${educationText || 'Not specified'}

## Experience
${experienceText || 'No detailed experience provided'}

## Key Achievements
${achievementsText || 'No achievements provided'}

## Generation Parameters
${targetRole ? `Target Role: ${targetRole}` : ''}
${focusAreas?.length ? `Focus Areas: ${focusAreas.join(', ')}` : ''}
Tone: ${tone ?? 'professional and confident'}

Write a 3-4 sentence career narrative that:
1. Opens with a strong identity statement (years of experience, domain)
2. Highlights 2-3 signature strengths or achievements with specifics
3. Conveys forward-looking motivation and unique value
4. Is optimized for use in LinkedIn summaries, cover letters, and elevator pitches

Return ONLY valid JSON (no markdown):
{
  "narrative": "The full career narrative text",
  "shortVersion": "1-2 sentence version for brevity",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "suggestedHeadline": "LinkedIn-style headline (120 chars max)"
}`,
        },
      ],
      {
        systemPrompt:
          'You are an expert career branding specialist. Write compelling, specific narratives that feel human and authentic. Return valid JSON only.',
        maxTokens: 1000,
        temperature: 0.75,
      }
    );

    const jsonText = result.content
      .replace(/^```(?:json)?\n?/m, '')
      .replace(/\n?```$/m, '')
      .trim();
    const parsed = JSON.parse(jsonText);

    return NextResponse.json(parsed, { status: 200 });
  } catch (error) {
    console.error('[narrative] Error:', error);
    return NextResponse.json(
      {
        narrative:
          'Results-driven professional with a track record of delivering high-impact solutions. Combines technical depth with strong collaboration skills to drive meaningful outcomes. Passionate about continuous learning and building products that make a difference.',
        shortVersion: 'Results-driven professional who delivers high-impact solutions.',
        keyThemes: ['Technical expertise', 'Collaboration', 'Impact'],
        suggestedHeadline: 'Software Engineer | Building scalable solutions',
      },
      { status: 200 }
    );
  }
}
