import { NextRequest, NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { callLLM } from '@/lib/llm/provider';

export const dynamic = 'force-dynamic';

/**
 * POST /api/profile/quantify
 * Receives a raw accomplishment draft and refines it into a STAR-formatted, quantified achievement.
 */
export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await getAuthContext();
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category } = await request.json();

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Missing title, description, or category' },
        { status: 400 }
      );
    }

    const systemPrompt = "You are a senior executive career strategist and executive coach specializing in STAR-formatted accomplishment quantification.";

    const userPrompt = `Given the following professional achievement log, refine it into a high-impact, professional description using the STAR (Situation, Task, Action, Result) methodology. 
Ensure the outcome is strongly quantified with clear, high-impact metrics (e.g., "+15% speedup", "saved 10 hours/week", "managed a team of 4") based on the input text. If no specific numbers are provided in the raw log, estimate a realistic, professional-grade metric based on standard software engineering and product management benchmarks, and format it clearly.

Input Details:
- Title: ${title}
- Category: ${category}
- Raw Log/Description: ${description}

Return ONLY a valid JSON object matching this structure (do not include markdown block ticks like \`\`\`json):
{
  "title": "A refined, executive-level title",
  "starContext": "Structured Situation-Task-Action-Result summary paragraph",
  "metrics": "A single high-impact string representing the primary quantified result (e.g., '+20% reduction in response latency')",
  "refinedDescription": "A markdown string containing 2-3 high-impact, results-driven bullet points starting with strong action verbs, perfect for a resume or self-appraisal."
}`;

    const result = await callLLM([
      { role: 'user', content: userPrompt }
    ], {
      systemPrompt,
      temperature: 0.3,
    });

    let data;
    try {
      // Clean potential JSON markdown blocks if returned by the LLM
      const cleaned = result.content
        .replace(/^```json\s*/i, '')
        .replace(/```\s*$/, '')
        .trim();
      data = JSON.parse(cleaned);
    } catch {
      // Safe fallback if JSON parsing fails
      data = {
        title: title,
        starContext: `Situation & Task: User reported: "${description}". Action & Result: Refined work item under ${category}.`,
        metrics: "[Estimated +15% impact]",
        refinedDescription: `* Optimized deliverables in the ${category} domain.\n* Formulated structured processes to ensure high-fidelity performance metrics.`
      };
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error in AI Quantifier endpoint:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
