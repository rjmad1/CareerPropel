/**
 * Accomplishment Bank Selector
 *
 * Ranks and selects accomplishments from the canonical bank for a
 * specific role target. Used by the variant generator to dynamically
 * assemble bullet sections without hallucinating content.
 */

import type { MasterAccomplishment } from '../master-profile/types';
import type { BankQuery, RankedAccomplishment, BankSelectionResult } from './types';

// ─── Relevance scoring ────────────────────────────────────────────────────────

function scoreAccomplishment(
  acc: MasterAccomplishment,
  query: BankQuery,
): { score: number; matchedSkills: string[]; matchedKeywords: string[] } {
  let score = 0;
  const matchedSkills: string[] = [];
  const matchedKeywords: string[] = [];

  const accText = [acc.action, acc.scope, acc.result, acc.category]
    .join(' ')
    .toLowerCase();

  // Skill overlap (highest weight)
  if (query.requiredSkills?.length) {
    for (const skill of query.requiredSkills) {
      if (
        acc.associatedSkills.some((s) => s.toLowerCase() === skill.toLowerCase()) ||
        accText.includes(skill.toLowerCase())
      ) {
        score += 20;
        matchedSkills.push(skill);
      }
    }
  }

  // Competency match
  if (query.competencies?.length && acc.competency) {
    if (query.competencies.some((c) => c.toLowerCase() === acc.competency!.toLowerCase())) {
      score += 15;
    }
  }

  // Industry alignment
  if (query.targetIndustry && acc.industry) {
    if (acc.industry.toLowerCase() === query.targetIndustry.toLowerCase()) {
      score += 10;
    }
  }

  // Role keyword overlap
  if (query.targetRole) {
    const roleWords = query.targetRole.toLowerCase().split(/\s+/);
    for (const word of roleWords) {
      if (word.length > 3 && accText.includes(word)) {
        score += 5;
        matchedKeywords.push(word);
      }
    }
  }

  // Metric presence bonus
  if (acc.metric) score += 10;

  // Verified bonus
  if (acc.isVerified) score += 5;

  return { score, matchedSkills, matchedKeywords };
}

// ─── Selector ────────────────────────────────────────────────────────────────

export function selectAccomplishments(
  bank: MasterAccomplishment[],
  query: BankQuery,
): BankSelectionResult {
  const limit  = query.limit ?? 10;
  const minScore = 0;

  const ranked: RankedAccomplishment[] = bank
    .filter((a) => !query.verifiedOnly || a.isVerified)
    .map((acc) => {
      const { score, matchedSkills, matchedKeywords } = scoreAccomplishment(acc, query);
      return { ...acc, relevanceScore: score, matchedSkills, matchedKeywords };
    })
    .filter((r) => r.relevanceScore >= minScore)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    selected:       ranked.slice(0, limit),
    totalInBank:    bank.length,
    scoreThreshold: minScore,
  };
}

// ─── Category grouping ────────────────────────────────────────────────────────

export function groupByCategory(
  accomplishments: MasterAccomplishment[],
): Record<string, MasterAccomplishment[]> {
  return accomplishments.reduce<Record<string, MasterAccomplishment[]>>((acc, item) => {
    const key = item.category ?? 'general';
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

// ─── Bullet assembly ──────────────────────────────────────────────────────────

/**
 * Assembles a structured accomplishment into an ATS-safe bullet string.
 * Format: Action + Scope + Result + Metric
 */
export function assembleBullet(acc: MasterAccomplishment): string {
  const parts: string[] = [acc.action];

  if (acc.scope && acc.scope !== acc.action) {
    parts.push(acc.scope);
  }

  if (acc.result) {
    parts.push(acc.result);
  }

  if (acc.metric && !acc.result.includes(acc.metric)) {
    parts.push(`(${acc.metric})`);
  }

  return parts.join(', ').replace(/,\s*,/g, ',').trim();
}
