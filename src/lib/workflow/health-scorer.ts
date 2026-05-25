import type { HealthScoreBreakdown, OpportunityHealthInput } from './types';

const STAGE_PROGRESSION: Record<string, number> = {
  sourced: 5,
  interested: 10,
  resume_tailoring: 15,
  applied: 25,
  recruiter_screen: 40,
  hiring_manager: 55,
  technical_interview: 65,
  system_design: 72,
  behavioral: 78,
  final_round: 88,
  offer: 95,
  negotiation: 98,
  rejected: 0,
  archived: 0,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function scoreOpportunityHealth(input: OpportunityHealthInput): HealthScoreBreakdown {
  // Recruiter responsiveness: higher contact = better
  const recruiterResponsiveness = clamp(
    input.hasRecruiterContact
      ? 40 + Math.min(input.recruiterResponseCount * 20, 60)
      : 10,
  );

  // Interview progression: based on pipeline stage
  const interviewProgression = clamp(STAGE_PROGRESSION[input.stage] ?? 20);

  // Inactivity penalty: older = worse
  const inactivityPenalty = clamp(
    input.daysSinceLastActivity <= 2  ? 100 :
    input.daysSinceLastActivity <= 7  ? 85 :
    input.daysSinceLastActivity <= 14 ? 65 :
    input.daysSinceLastActivity <= 30 ? 40 :
    input.daysSinceLastActivity <= 60 ? 20 : 5,
  );

  // Match quality: direct from score
  const matchQuality = clamp(input.matchScore);

  // Networking engagement: more contacts = better
  const networkingEngagement = clamp(Math.min(input.contactCount * 25, 100));

  // Follow-up cadence: has pending follow-up or active workflow
  const followUpCadence = clamp(
    (input.pendingFollowUp ? 40 : 0) +
    (input.activeWorkflowCount > 0 ? 40 : 0) +
    (input.interviewCount > 0 ? 20 : 0),
  );

  // Weighted composite
  const overall = clamp(
    recruiterResponsiveness * 0.20 +
    interviewProgression    * 0.25 +
    inactivityPenalty       * 0.20 +
    matchQuality            * 0.15 +
    networkingEngagement    * 0.10 +
    followUpCadence         * 0.10,
  );

  return {
    recruiterResponsiveness,
    interviewProgression,
    inactivityPenalty,
    matchQuality,
    networkingEngagement,
    followUpCadence,
    overall,
  };
}

/** Categorize a health score into a label */
export function healthLabel(score: number): 'stale' | 'at_risk' | 'active' | 'momentum' | 'hot' {
  if (score >= 80) return 'hot';
  if (score >= 60) return 'momentum';
  if (score >= 40) return 'active';
  if (score >= 20) return 'at_risk';
  return 'stale';
}
