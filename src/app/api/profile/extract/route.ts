import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { ProfileEntity } from '@/types/profile';
import { trackFunnelEvent } from '@/lib/observability/funnel';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Telemetry: track start of parsing
    await trackFunnelEvent(userEmail, 'resume', 'parse', 'started');

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    const body = await request.json();
    const { text, source } = body as { text: string; source: 'resume' | 'linkedin' | 'cover_letter' | 'other' };

    if (!text) {
      return NextResponse.json({ error: 'text content is required for extraction' }, { status: 400 });
    }

    const systemPrompt = `You are an expert ATS parser and professional CV data analyst. Extract semantic entities representing the candidate's career from their plain text resume or profile.`;

    const userPrompt = `Deconstruct the following parsed document text and extract all professional entities: skills, key achievements, experience, education, and certifications.
    
    TEXT:
    ${text.slice(0, 8000)}

    Format your output strictly as a valid JSON object matching the following structure:
    {
      "entities": [
        {
          "type": "skill",
          "content": "React",
          "confidence": 0.98,
          "tags": ["technical", "frontend"]
        },
        {
          "type": "achievement",
          "content": "Reduced dashboard latency by 32% utilizing optimistic client state updates, increasing render performance to 24 FPS.",
          "confidence": 0.92,
          "tags": ["latency", "performance", "react"]
        },
        {
          "type": "experience",
          "content": "Senior Software Engineer at TechCorp Solutions (2024 - Present)",
          "confidence": 0.95,
          "tags": ["career", "engineering"]
        },
        {
          "type": "education",
          "content": "Bachelor of Science in Computer Science, GPA: 3.8",
          "confidence": 0.98,
          "tags": ["academic", "degree"]
        },
        {
          "type": "certification",
          "content": "AWS Certified Solutions Architect - Associate",
          "confidence": 0.95,
          "tags": ["cloud", "credentials"]
        }
      ]
    }

    Extraction Rules:
    1. For "skill": Extract technical languages, frameworks, domain methodologies, or soft skills. Content should be standard/normalized skill names.
    2. For "achievement": Extract high-impact milestones. Make sure to capture specific numbers, metrics, or timeframes.
    3. For "experience": Extract jobs/positions held, including title and company.
    4. For "education": Extract degrees, schools, and academic details.
    5. For "certification": Extract cloud/professional credentials.
    6. Assign realistic confidence scores between 0.0 and 1.0 based on clarity and specificity in the text.
    7. Generate relevant tags (e.g. tech keywords, category labels) for each entity.

    Return ONLY valid JSON. No markdown fences, no conversational preambles.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        maxTokens: 2048,
        temperature: 0.2,
      }
    );

    const rawResponse = result.content.trim();
    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);

    if (!parsed || !Array.isArray(parsed.entities)) {
      throw new Error('Failed to extract structural entities from LLM response.');
    }

    // Convert raw extracted objects to ProfileEntity format
    const entities: ProfileEntity[] = parsed.entities.map((item: any, index: number) => {
      const uid = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;
      return {
        id: `extracted_entity_${uid}`,
        candidateId: candidate.id,
        type: item.type || 'skill',
        content: item.content || '',
        confidence: Math.round((item.confidence || 0.90) * 100) / 100,
        source: source || 'resume',
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
        relatedEntityIds: [],
        extractedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    // Telemetry: track completed parsing
    await trackFunnelEvent(userEmail, 'resume', 'parse', 'completed');

    return NextResponse.json({ success: true, entities }, { status: 200 });
  } catch (error) {
    console.error('[AI Extract POST] Error:', error);
    try {
      const { userEmail } = await getAuthContext();
      if (userEmail) {
        await trackFunnelEvent(userEmail, 'resume', 'parse', 'failed', { error: error instanceof Error ? error.message : String(error) });
      }
    } catch {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to extract entities from document' },
      { status: 500 }
    );
  }
}
