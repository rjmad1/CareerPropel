/**
 * Keyword Gap Analyzer
 *
 * Compares extracted JD keywords against resume content to produce
 * a coverage report: matched, missing, overused.
 */

import type { ExtractedKeywords } from './keywordExtractor';
import { detectSynonymizations } from './keywordNormalizer';

export interface KeywordGapReport {
  /** Keywords present in resume (exact or near-exact) */
  matched:       string[];
  /** Keywords in JD but absent from resume */
  missing:       string[];
  /** Keywords that appear so often they look like spam */
  overused:      string[];
  /** Synonymization warnings — JD says X, resume says Y instead */
  synonymized:   Array<{ jdTerm: string; resumeTerm: string }>;
  /** 0–1 fraction of required keywords covered */
  coverageScore: number;
  /** 0–1 exact match rate */
  exactMatchRate: number;
  /** Penalty applied for synonymizations */
  synonymPenalty: number;
}

const OVERUSE_THRESHOLD = 5; // occurrences before flagged as overused

function countOccurrences(text: string, keyword: string): number {
  const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return (text.match(re) ?? []).length;
}

export function analyzeKeywordGap(
  jdKeywords: ExtractedKeywords,
  resumeText: string,
): KeywordGapReport {
  const allJdKeywords = [...new Set([
    ...jdKeywords.required,
    ...jdKeywords.preferred,
    ...jdKeywords.title,
  ])];

  const matched:  string[] = [];
  const missing:  string[] = [];
  const overused: string[] = [];

  for (const kw of allJdKeywords) {
    const count = countOccurrences(resumeText, kw);
    if (count === 0) {
      missing.push(kw);
    } else {
      matched.push(kw);
      if (count >= OVERUSE_THRESHOLD) overused.push(kw);
    }
  }

  const synonymized = detectSynonymizations(allJdKeywords, resumeText);

  const coverageScore = allJdKeywords.length
    ? matched.length / allJdKeywords.length
    : 1;

  const exactMatchRate = jdKeywords.required.length
    ? jdKeywords.required.filter((k) => !missing.includes(k)).length /
      jdKeywords.required.length
    : 1;

  const synonymPenalty = synonymized.length * 0.05; // 5% per synonymization

  return {
    matched,
    missing,
    overused,
    synonymized,
    coverageScore:  Math.min(1, coverageScore),
    exactMatchRate: Math.min(1, exactMatchRate),
    synonymPenalty: Math.min(0.5, synonymPenalty),
  };
}
