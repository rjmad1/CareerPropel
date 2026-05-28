import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { prisma } from '@/lib/db';
import { parseDocumentBuffer } from '@/lib/profile/server-parser';
import { extractProfileEntities } from '@/lib/profile/extractor';
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

    // Telemetry: track start of upload funnel
    await trackFunnelEvent(userEmail, 'resume', 'upload', 'started');

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // 1. Read Multipart File Upload
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No document file uploaded' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const source = file.name.endsWith('.json') ? 'linkedin' : 'resume';

    // 2. Layer 1: Real Binary Parser Text Extraction
    console.log(`[Parser] Parsing uploaded file: ${file.name} (MimeType: ${file.type})`);
    const plainText = await parseDocumentBuffer(fileBuffer, file.type || file.name);

    if (!plainText || plainText.trim().length === 0) {
      throw new Error('Document contained no readable text content.');
    }

    // 3. Layer 1: Local Deterministic Profile Extraction
    console.log('[Parser] Executing Layer 1 local deterministic extraction...');
    const localEntities = extractProfileEntities(plainText, source, candidate.id);

    // 4. Layer 2: Best-Effort AI Semantic Enrichment
    try {
      console.log('[Parser] Executing Layer 2 AI semantic enrichment...');
      
      const systemPrompt = `You are a Chief Talent Analyst. Enrich the parsed deterministic resume extractions into standard STAR-format achievements and clean technical skill nodes.`;
      
      const userPrompt = `Given the plain text CV and the initial local extractions, perform deep AI semantic enrichment.
      
      PLAIN TEXT RESUME CONTENT:
      ${plainText.slice(0, 5000)}

      INITIAL DETERMINISTIC EXTRACTIONS:
      ${JSON.stringify(localEntities)}

      Format your output strictly as a valid JSON object matching the following structure:
      {
        "entities": [
          {
            "type": "skill",
            "content": "TypeScript",
            "confidence": 0.98,
            "tags": ["technical", "typescript"]
          },
          {
            "type": "achievement",
            "content": "Pioneered E2E Cypress automation structures spanning 3 principal repositories, elevating testing code coverage from 64% to 98% and removing high-priority hotfixes.",
            "confidence": 0.94,
            "tags": ["testing", "cypress", "typescript"]
          }
        ]
      }

      Enrichment Instructions:
      1. Review the initial deterministic extractions. Normalize skill names and expand them.
      2. Group related skills (e.g. Next.js, React, TypeScript).
      3. Polish all raw experiences and accomplishments into highly compelling, quantifiable STAR achievements (Situation, Task, Action, Result).
      4. Ensure confidence scores are realistic (0.0 to 1.0) and output matches schema.
      
      Return ONLY valid JSON. No conversational preambles.`;

      const result = await callLLM(
        [{ role: 'user', content: userPrompt }],
        {
          systemPrompt,
          maxTokens: 2000,
          temperature: 0.3,
        }
      );

      const rawResponse = result.content.trim();
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse);

      if (parsed && Array.isArray(parsed.entities)) {
        const enrichedEntities: ProfileEntity[] = parsed.entities.map((item: any, index: number) => {
          const uid = `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`;
          return {
            id: `extracted_entity_${uid}`,
            candidateId: candidate.id,
            type: item.type || 'skill',
            content: item.content || '',
            confidence: Math.round((item.confidence || 0.95) * 100) / 100,
            source,
            tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
            relatedEntityIds: [],
            extractedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
            // Mark source as verified AI
            metadata: { source: 'ai', confidence: 'high' }
          };
        });

        console.log(`[Parser] AI semantic enrichment succeeded! Extracted ${enrichedEntities.length} enriched entities.`);
        await trackFunnelEvent(userEmail, 'resume', 'upload', 'completed', { source: 'ai' });
        return NextResponse.json({ success: true, source: 'ai', confidence: 'high', entities: enrichedEntities }, { status: 200 });
      }
      
      throw new Error('LLM failed to return structured entities list.');
    } catch (aiErr) {
      console.warn('[Parser] Layer 2 AI semantic enrichment failed. Activating degraded mode fallback:', aiErr);
      
      // Fallback: fail-open gracefully to Layer 1 deterministic local baseline
      const fallbackEntities = localEntities.map((entity) => ({
        ...entity,
        confidence: 0.50, // Flagged low confidence degraded mode
        metadata: {
          source: 'fallback',
          confidence: 'low',
          reason: `AI enrichment failed: ${aiErr instanceof Error ? aiErr.message : String(aiErr)}`
        }
      }));

      await trackFunnelEvent(userEmail, 'resume', 'upload', 'completed', { source: 'fallback' });
      return NextResponse.json({
        success: true,
        source: 'fallback',
        confidence: 'low',
        reason: 'AI enrichment service temporarily offline. Displaying local deterministic parsing.',
        entities: fallbackEntities
      }, { status: 200 });
    }
  } catch (error) {
    console.error('[AI Upload POST] Error:', error);
    try {
      const { userEmail } = await getAuthContext();
      if (userEmail) {
        await trackFunnelEvent(userEmail, 'resume', 'upload', 'failed', { error: error instanceof Error ? error.message : String(error) });
      }
    } catch {}
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error during file parsing.' },
      { status: 500 }
    );
  }
}
