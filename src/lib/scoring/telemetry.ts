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
    // Find candidate's fit scoring snapshot for this job
    const snapshot = await prisma.fitScoringSnapshot.findUnique({
      where: {
        jobId,
      },
      include: {
        job: {
          include: {
            jobIntelligence: true
          }
        }
      }
    });

    if (!snapshot || !snapshot.job || !snapshot.job.jobIntelligence) return;

    const weights = snapshot.job.jobIntelligence.archetypeWeights as Record<string, number> | null;
    if (!weights) return;

    // Record success correlation mapping or increment entry counters in PatternLibraryEntry
    for (const archetype of Object.keys(weights)) {
      const existingEntry = await prisma.patternLibraryEntry.findFirst({
        where: {
          candidateId,
          archetypeCorrelation: archetype as any
        }
      });

      const successfulOutcome = outcome === 'progressed' || outcome === 'offer';

      if (existingEntry) {
        const newFrequency = existingEntry.frequencyObserved + 1;
        const currentSuccesses = Math.round((existingEntry.conversionRate ?? 0) * existingEntry.frequencyObserved);
        const newSuccesses = currentSuccesses + (successfulOutcome ? 1 : 0);
        const newConversionRate = newSuccesses / newFrequency;

        await prisma.patternLibraryEntry.update({
          where: { id: existingEntry.id },
          data: {
            frequencyObserved: newFrequency,
            conversionRate: newConversionRate
          }
        });
      } else {
        await prisma.patternLibraryEntry.create({
          data: {
            candidateId,
            archetypeCorrelation: archetype as any,
            category: 'ARCHETYPE_CORRELATION',
            pattern: `High match correlation for archetype ${archetype}`,
            frequencyObserved: 1,
            conversionRate: successfulOutcome ? 1.0 : 0.0,
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
  const snapshots = await prisma.fitScoringSnapshot.findMany({
    where: { candidateId },
    include: {
      job: {
        include: {
          jobIntelligence: true
        }
      }
    }
  });

  let totalMapped = 0;
  let successfulConversions = 0;
  let falsePositives = 0; // high score but rejected early
  const archetypeScores: Record<string, { sum: number; count: number; successes: number }> = {};

  for (const snapshot of snapshots) {
    if (!snapshot.job.jobIntelligence) continue;

    totalMapped++;
    const stage = snapshot.job.stage;
    const isSuccessful = ['recruiter_screen', 'hiring_manager', 'technical_interview', 'system_design', 'behavioral', 'final_round', 'offer', 'negotiation'].includes(stage);

    if (isSuccessful) {
      successfulConversions++;
    }

    const fitScore = snapshot.fitScore * 100;

    // High fit score (>75) but rejected / archived without interview
    if (fitScore >= 75 && (stage === 'rejected' || stage === 'archived')) {
      falsePositives++;
    }

    const weights = snapshot.job.jobIntelligence.archetypeWeights as Record<string, number> | null;
    if (weights) {
      for (const [arch, weight] of Object.entries(weights)) {
        const entry = archetypeScores[arch] ?? { sum: 0, count: 0, successes: 0 };
        entry.sum += fitScore * weight;
        entry.count += weight;
        if (isSuccessful) {
          entry.successes++;
        }
        archetypeScores[arch] = entry;
      }
    }
  }

  const suggestions: CalibrationSuggestion[] = [];

  // Suggest dynamic weight calibrations based on outcomes
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
