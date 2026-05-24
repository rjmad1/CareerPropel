/**
 * POST /api/offers/[id]/decision
 *
 * AI-powered offer decision scoring. The caller provides importance weights
 * (0-10) for each dimension; Claude evaluates the offer holistically and
 * returns a composite score, per-dimension breakdown, and a clear recommendation.
 *
 * Request body:
 *   weights: {
 *     compensation: number   // base + bonus + equity importance
 *     growth: number         // career growth potential
 *     culture: number        // team / company culture fit
 *     wlb: number            // work-life balance
 *     security: number       // company stability / job security
 *     location: number       // remote/hybrid/location preference
 *   }
 *   context?: string         // optional free-text about the candidate's priorities
 *
 * Response:
 *   overallScore: number         // 0-100
 *   dimensionScores: { ... }     // each dimension 0-100
 *   recommendation: string       // clear text recommendation
 *   pros: string[]
 *   cons: string[]
 *   summary: string
 */

import { NextRequest } from 'next/server';
import { getAuthContext } from '@/lib/middleware/auth';
import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { prisma } from '@/lib/db';
import { callLLM } from '@/lib/llm/provider';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const WeightsSchema = z.object({
  compensation: z.number().min(0).max(10).default(7),
  growth: z.number().min(0).max(10).default(7),
  culture: z.number().min(0).max(10).default(5),
  wlb: z.number().min(0).max(10).default(5),
  security: z.number().min(0).max(10).default(5),
  location: z.number().min(0).max(10).default(3),
});

const DecisionRequestSchema = z.object({
  weights: WeightsSchema,
  context: z.string().max(500).optional(),
});

interface DimensionScores {
  compensation: number;
  growth: number;
  culture: number;
  wlb: number;
  security: number;
  location: number;
}

interface DecisionResult {
  overallScore: number;
  dimensionScores: DimensionScores;
  recommendation: string;
  pros: string[];
  cons: string[];
  summary: string;
}

/** Weighted arithmetic mean composite, normalized to 0-100. Falls back to 50 when totalWeight === 0. */
function computeComposite(
  scores: DimensionScores,
  weights: z.infer<typeof WeightsSchema>
): number {
  const dimensions = Object.keys(weights) as (keyof DimensionScores)[];
  const totalWeight = dimensions.reduce((s, k) => s + weights[k], 0);
  if (totalWeight === 0) return 50;
  const weighted = dimensions.reduce(
    (s, k) => s + scores[k] * weights[k],
    0
  );
  return Math.round(weighted / totalWeight);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { userEmail } = await getAuthContext();

    const candidate = await prisma.candidate.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!candidate) return errorResponse(new Error('Candidate not found'), 404);

    // Verify ownership
    const offer = await prisma.offer.findFirst({
      where: { id, candidateId: candidate.id },
      include: { job: true },
    });
    if (!offer) return errorResponse(new Error('Offer not found'), 404);

    const body = await request.json();
    const parsed = DecisionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(new Error(parsed.error.errors[0].message), 400);
    }
    const { weights, context: userContext } = parsed.data;

    const salaryDisplay = offer.salary
      ? `$${offer.salary.toLocaleString()} base`
      : 'undisclosed base';
    const bonusDisplay = offer.bonus ? ` + $${offer.bonus.toLocaleString()} bonus` : '';
    const equityDisplay = offer.equity ? ` + ${offer.equity} equity` : '';
    const startDisplay = offer.startDate
      ? `Start date: ${offer.startDate.toISOString().slice(0, 10)}.`
      : '';

    const prompt = `You are a career advisor helping a candidate evaluate a job offer.

## Offer Details
Role: ${offer.job.title} at ${offer.job.company}
Compensation: ${salaryDisplay}${bonusDisplay}${equityDisplay}
${startDisplay}
${offer.notes ? `Notes: ${offer.notes}` : ''}

## Candidate Priorities (weights 0-10, higher = more important)
Compensation: ${weights.compensation}/10
Career Growth: ${weights.growth}/10
Culture & Team Fit: ${weights.culture}/10
Work-Life Balance: ${weights.wlb}/10
Company Stability/Security: ${weights.security}/10
Location/Remote Flexibility: ${weights.location}/10
${userContext ? `\nAdditional context: ${userContext}` : ''}

## Task
Score this offer across each dimension from 0-100 (50 = average market offer, 100 = exceptional).
Base scores on: compensation benchmarks for the role/company type, ${offer.job.company}'s known culture,
remote work policies typical for this company type, growth opportunities for a ${offer.job.title} role,
and general company stability signals.

Return ONLY valid JSON (no markdown fences):
{
  "dimensionScores": {
    "compensation": <0-100>,
    "growth": <0-100>,
    "culture": <0-100>,
    "wlb": <0-100>,
    "security": <0-100>,
    "location": <0-100>
  },
  "recommendation": "<clear one-sentence recommendation: accept / negotiate / decline>",
  "pros": ["<specific pro>", "<specific pro>", "<specific pro>"],
  "cons": ["<specific con>", "<specific con>"],
  "summary": "<2-3 sentence balanced summary>"
}`;

    let result: DecisionResult;

    try {
      const llmResult = await callLLM(
        [{ role: 'user', content: prompt }],
        {
          systemPrompt:
            'You are an expert career advisor. Return only valid JSON — no markdown, no explanatory text.',
          maxTokens: 600,
          temperature: 0.3,
        }
      );

      const raw = llmResult.content.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const llmParsed = JSON.parse(raw);

      const scores: DimensionScores = {
        compensation: Math.max(0, Math.min(100, llmParsed.dimensionScores?.compensation ?? 50)),
        growth: Math.max(0, Math.min(100, llmParsed.dimensionScores?.growth ?? 50)),
        culture: Math.max(0, Math.min(100, llmParsed.dimensionScores?.culture ?? 50)),
        wlb: Math.max(0, Math.min(100, llmParsed.dimensionScores?.wlb ?? 50)),
        security: Math.max(0, Math.min(100, llmParsed.dimensionScores?.security ?? 50)),
        location: Math.max(0, Math.min(100, llmParsed.dimensionScores?.location ?? 50)),
      };

      result = {
        overallScore: computeComposite(scores, weights),
        dimensionScores: scores,
        recommendation: llmParsed.recommendation ?? 'Evaluate against competing offers.',
        pros: Array.isArray(llmParsed.pros) ? llmParsed.pros.slice(0, 5) : [],
        cons: Array.isArray(llmParsed.cons) ? llmParsed.cons.slice(0, 5) : [],
        summary: llmParsed.summary ?? '',
      };
    } catch {
      // Graceful fallback — neutral scores
      const fallback: DimensionScores = {
        compensation: 55,
        growth: 55,
        culture: 55,
        wlb: 55,
        security: 55,
        location: 55,
      };
      result = {
        overallScore: computeComposite(fallback, weights),
        dimensionScores: fallback,
        recommendation: 'AI scoring unavailable — consider negotiating for more information.',
        pros: ['Offer received — a positive signal'],
        cons: ['Unable to generate detailed analysis at this time'],
        summary:
          'Scoring service temporarily unavailable. Please try again or evaluate manually.',
      };
    }

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
