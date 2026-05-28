import { RELATIONSHIP_SCORE_WEIGHTS, SENIORITY_AUTHORITY_SCORES } from '../constants';
import { RelationshipScore, ScoreRelationshipParams } from '../types';

/**
 * Pure deterministic relationship scorer — no LLM calls.
 * Weights: hiringAuthority 25%, roleAlignment 20%, mutualConnections 15%,
 *          recruiterSpecialization 15%, responseProbability 10%,
 *          companyInfluence 10%, activityRecency 5%
 */
export function scoreRelationship(params: ScoreRelationshipParams): RelationshipScore {
  const hiringAuthority = SENIORITY_AUTHORITY_SCORES[params.hiringAuthorityLevel] ?? 0.3;
  const roleAlignment = Math.min(Math.max(params.roleAlignmentPercent / 100, 0), 1);
  const mutualConnections = Math.min(params.mutualConnectionCount / 10, 1);
  const recruiterSpecialization = params.isSpecializedRecruiter ? 0.9 : 0.4;
  const responseProbability = Math.min(Math.max(params.historicalResponseRate, 0), 1);
  const companyInfluence =
    params.companySize === 'ENTERPRISE' ? 0.8 :
    params.companySize === 'MID' ? 0.6 : 0.9;
  const activityRecency = Math.max(0, 1 - params.lastActivityDaysAgo / 90);

  const breakdown: Record<string, number> = {
    hiringAuthority,
    roleAlignment,
    mutualConnections,
    recruiterSpecialization,
    responseProbability,
    companyInfluence,
    activityRecency,
  };

  const total = (Object.keys(RELATIONSHIP_SCORE_WEIGHTS) as Array<keyof typeof RELATIONSHIP_SCORE_WEIGHTS>)
    .reduce((sum, key) => sum + (breakdown[key] ?? 0) * RELATIONSHIP_SCORE_WEIGHTS[key], 0);

  return {
    total: Math.round(total * 1000) / 1000,
    hiringAuthority,
    roleAlignment,
    mutualConnections,
    recruiterSpecialization,
    responseProbability,
    companyInfluence,
    activityRecency,
    breakdown,
  };
}

export function seniorityFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (['cto', 'ceo', 'cpo', 'chief', 'founder'].some((k) => lower.includes(k))) return 'C_LEVEL';
  if (['vp', 'vice president', 'svp'].some((k) => lower.includes(k))) return 'VP';
  if (['director', 'head of'].some((k) => lower.includes(k))) return 'DIRECTOR';
  if (['principal', 'staff', ' lead'].some((k) => lower.includes(k))) return 'LEAD';
  if (['senior', 'sr.', ' sr '].some((k) => lower.includes(k))) return 'SENIOR';
  if (['junior', 'jr.', 'associate', 'entry'].some((k) => lower.includes(k))) return 'JUNIOR';
  return 'MID';
}

export function companySizeFromEmployeeCount(count?: number): 'STARTUP' | 'MID' | 'ENTERPRISE' {
  if (!count) return 'MID';
  if (count < 200) return 'STARTUP';
  if (count < 2000) return 'MID';
  return 'ENTERPRISE';
}
