import { prisma } from '@/lib/db';

export interface CalibrationSuggestion {
  archetype: string;
  dimension: string;
  currentWeight: number;
  suggestedWeight: number;
  reason: string;
}

/**
 * Record a progression outcome (e.g. interview scheduled, recruiter response, rejected)
 * to correlate historical fit scores with actual recruiter conversion rates.
 */
export async function recordConversionOutcome(
  candidateId: string,
  jobId: string,
  _stage: string,
  outcome: 'progressed' | 'rejected' | 'offer'
) {
  try {
    // Find candidate's fit analysis for this job
    const analysis = await prisma.roleFitAnalysis.findFirst({
      where: {
        candidateId,
        jobIntelligence: {
          jobId
        }
      },
      include: {
        jobIntelligence: {
          include: {
            archetypes: true
          }
        }
      }
    });

    if (!analysis || !analysis.jobIntelligence) return;

    // Record success correlation mapping or increment entry counters in PatternLibraryEntry
    for (const arch of analysis.jobIntelligence.archetypes) {
      const existingEntry = await prisma.patternLibraryEntry.findFirst({
        where: {
          candidateId,
          roleArchetype: arch.archetype
        }
      });

      const successDelta = outcome === 'progressed' || outcome === 'offer' ? 10.0 : -5.0;

      if (existingEntry) {
        await prisma.patternLibraryEntry.update({
          where: { id: existingEntry.id },
          data: {
            conversionCount: existingEntry.conversionCount + (outcome === 'progressed' || outcome === 'offer' ? 1 : 0),
            successScore: Math.max(0, Math.min(100, existingEntry.successScore + successDelta))
          }
        });
      } else {
        await prisma.patternLibraryEntry.create({
          data: {
            candidateId,
            roleArchetype: arch.archetype,
            conversionCount: outcome === 'progressed' || outcome === 'offer' ? 1 : 0,
            successScore: outcome === 'progressed' || outcome === 'offer' ? 75.0 : 45.0,
            operationalKeywords: [],
            businessProblems: [],
            successMetrics: [],
            languagePatterns: [],
            achievementsMapped: []
          }
        });
      }
    }
  } catch (error) {
    console.error('[recordConversionOutcome] Error tracking conversion telemetry:', error);
  }
}

/**
 * Evaluates the performance of the Role Intelligence scoring model.
 * Computes false-positives, average conversion rates by archetype, and suggests weight calibrations.
 */
export async function calibrateScoringWeights(candidateId: string): Promise<{
  conversionRate: number;
  falsePositiveRate: number;
  archetypePerformances: Array<{ archetype: string; avgScore: number; successCount: number }>;
  suggestions: CalibrationSuggestion[];
}> {
  const analyses = await prisma.roleFitAnalysis.findMany({
    where: { candidateId },
    include: {
      jobIntelligence: {
        include: {
          job: {
            select: { stage: true }
          },
          archetypes: true
        }
      }
    }
  });

  let totalMapped = 0;
  let successfulConversions = 0;
  let falsePositives = 0; // high score but rejected early
  const archetypeScores: Record<string, { sum: number; count: number; successes: number }> = {};

  for (const analysis of analyses) {
    if (!analysis.jobIntelligence) continue;

    totalMapped++;
    const stage = analysis.jobIntelligence.job.stage;
    const isSuccessful = ['recruiter_screen', 'hiring_manager', 'technical_interview', 'system_design', 'behavioral', 'final_round', 'offer', 'negotiation'].includes(stage);

    if (isSuccessful) {
      successfulConversions++;
    }

    // High fit score (>75) but rejected / archived without interview
    if (analysis.overallFitScore >= 75 && (stage === 'rejected' || stage === 'archived')) {
      falsePositives++;
    }

    for (const arch of analysis.jobIntelligence.archetypes) {
      const entry = archetypeScores[arch.archetype] ?? { sum: 0, count: 0, successes: 0 };
      entry.sum += analysis.overallFitScore * arch.weight;
      entry.count += arch.weight;
      if (isSuccessful) {
        entry.successes++;
      }
      archetypeScores[arch.archetype] = entry;
    }
  }

  const suggestions: CalibrationSuggestion[] = [];

  // Suggest dynamic weight calibrations based on outcomes
  // E.g. If Keyword Overlap is currently 2% but high keyword-perfect matches lead to false-positives, suggest reducing keyword overlap weight further.
  // If high demonstrated execution proof strongly correlates with offers/progressions, suggest increasing execution proof weight.
  for (const [archetype, stats] of Object.entries(archetypeScores)) {
    const avgScore = stats.count > 0 ? stats.sum / stats.count : 0;
    const conversionRate = stats.successes / (stats.count || 1);

    if (conversionRate < 0.20 && avgScore > 75) {
      suggestions.push({
        archetype,
        dimension: 'keywordOverlap',
        currentWeight: 2,
        suggestedWeight: 0,
        reason: `High false-positives for ${archetype}. AI recommends suppressing keyword weight to reduce buzzword-perfect but execution-light inflation.`
      });
    }

    if (conversionRate > 0.70 && avgScore > 80) {
      suggestions.push({
        archetype,
        dimension: 'executionProof',
        currentWeight: 30,
        suggestedWeight: 35,
        reason: `Exceptional conversion rate for ${archetype} matches. Emphasize demonstrated execution proof to highlight high-leverage outcomes.`
      });
    }
  }

  return {
    conversionRate: totalMapped > 0 ? (successfulConversions / totalMapped) * 100 : 0,
    falsePositiveRate: totalMapped > 0 ? (falsePositives / totalMapped) * 100 : 0,
    archetypePerformances: Object.entries(archetypeScores).map(([archetype, stats]) => ({
      archetype,
      avgScore: stats.count > 0 ? parseFloat((stats.sum / stats.count).toFixed(2)) : 0,
      successCount: stats.successes
    })),
    suggestions
  };
}
