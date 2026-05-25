/**
 * ATS Scorer
 *
 * Produces a composite ATS score (0–100) for a resume variant against a job.
 *
 * Score components:
 *  - Keyword coverage      (40%)
 *  - Exact match rate      (25%)
 *  - Format compliance     (20%)
 *  - Chronology integrity  (10%)
 *  - Synonym penalty       ( 5% deduction)
 */

import type { KeywordGapReport } from './keywordGapAnalyzer';
import type { ParserValidationSummary } from './parsers';

export interface ATSScoreBreakdown {
  /** 0–100 composite score */
  overall:           number;
  /** 0–40 contribution from keyword coverage */
  keywordCoverage:   number;
  /** 0–25 contribution from exact required keyword matches */
  exactMatchRate:    number;
  /** 0–20 contribution from format/parser compliance */
  formatCompliance:  number;
  /** 0–10 contribution from clean chronology */
  chronologyScore:   number;
  /** 0–5 deduction for synonymizations */
  synonymPenalty:    number;
  /** Human-readable risk level */
  riskLevel:         'low' | 'medium' | 'high' | 'critical';
  /** Prioritized list of improvement actions */
  recommendations:   string[];
}

export function computeATSScore(
  gap: KeywordGapReport,
  parserSummary: ParserValidationSummary,
): ATSScoreBreakdown {
  // Component scores
  const keywordCoverage  = Math.round(gap.coverageScore * 40);
  const exactMatchRate   = Math.round(gap.exactMatchRate * 25);
  const formatCompliance = parserSummary.formatScore; // 0–20
  const chronologyScore  = parserSummary.chronologyScore; // 0–10
  const synonymPenalty   = Math.round(gap.synonymPenalty * 100 * 0.05); // capped at 5

  const overall = Math.max(
    0,
    Math.min(
      100,
      keywordCoverage + exactMatchRate + formatCompliance + chronologyScore - synonymPenalty,
    ),
  );

  const riskLevel: ATSScoreBreakdown['riskLevel'] =
    overall >= 80 ? 'low' :
    overall >= 60 ? 'medium' :
    overall >= 40 ? 'high' :
    'critical';

  // Recommendations ordered by impact
  const recommendations: string[] = [];

  if (gap.missing.length > 0) {
    recommendations.push(
      `Add missing required keywords: ${gap.missing.slice(0, 5).join(', ')}`,
    );
  }
  if (gap.synonymized.length > 0) {
    for (const s of gap.synonymized) {
      recommendations.push(
        `Replace "${s.resumeTerm}" with exact JD term "${s.jdTerm}"`,
      );
    }
  }
  if (gap.overused.length > 0) {
    recommendations.push(
      `Reduce overuse of: ${gap.overused.join(', ')} (${gap.overused.length} terms appear ≥5×)`,
    );
  }
  if (!parserSummary.headingsValid) {
    recommendations.push('Fix section headings — use standard names: Experience, Skills, Education');
  }
  if (!parserSummary.datesValid) {
    recommendations.push('Standardize date formats — use MM/YYYY or Month YYYY consistently');
  }
  if (!parserSummary.contactValid) {
    recommendations.push('Ensure name, email, and phone are on separate lines at the top');
  }

  return {
    overall,
    keywordCoverage,
    exactMatchRate,
    formatCompliance,
    chronologyScore,
    synonymPenalty,
    riskLevel,
    recommendations,
  };
}

/** Compute a recruiter skim-optimization score (0–100). */
export function computeRecruiterScore(
  resumeText: string,
  topKeywords: string[],
): number {
  let score = 0;

  // Top-third content quality (first ~33% of text)
  const topThird = resumeText.slice(0, Math.floor(resumeText.length / 3));
  const keywordsInTopThird = topKeywords.filter((k) =>
    topThird.toLowerCase().includes(k.toLowerCase()),
  ).length;
  score += Math.min(30, keywordsInTopThird * 3);

  // Metric density (numbers in resume)
  const metricCount = (resumeText.match(/\d+(\.\d+)?(%|x|\$|M\b|K\b)/g) ?? []).length;
  score += Math.min(25, metricCount * 2);

  // Action verb density
  const verbCount = (resumeText.match(/^[•\-*]\s+[A-Z][a-z]+/gm) ?? []).length;
  score += Math.min(20, verbCount * 2);

  // Section structure bonus
  const hasRequiredSections = [
    /^##?\s*(experience|work experience)/im,
    /^##?\s*(skills|core competencies)/im,
    /^##?\s*(education)/im,
  ].filter((p) => p.test(resumeText)).length;
  score += hasRequiredSections * 8;

  // Brevity: penalize if too long (>800 words is risky for skim)
  const wordCount = resumeText.split(/\s+/).length;
  if (wordCount > 800) score -= Math.min(15, Math.floor((wordCount - 800) / 50));

  return Math.max(0, Math.min(100, score));
}
