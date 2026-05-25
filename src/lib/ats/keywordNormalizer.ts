/**
 * ATS Keyword Normalizer
 *
 * Normalizes keyword casing and resolves aliases — but NEVER synonymizes.
 *
 * The distinction:
 *  - Normalization: "postgres" → "PostgreSQL" (same concept, canonical spelling)
 *  - Synonymization: "Product Delivery Management" ← "Product Lifecycle Management" ← FORBIDDEN
 *
 * This module only handles the first category.
 */

import { normalizeSkillName } from '../profile/master-profile/normalizer';

/** Known abbreviation expansions for ATS canonical forms */
const ABBREVIATION_MAP: Record<string, string> = {
  'plm':  'Product Lifecycle Management',
  'mlm':  'Machine Learning',
  'nlp':  'Natural Language Processing',
  'llm':  'Large Language Models',
  'ml':   'Machine Learning',
  'dl':   'Deep Learning',
  'cv':   'Computer Vision',
  'sre':  'Site Reliability Engineering',
  'iac':  'Infrastructure as Code',
  'sdlc': 'Software Development Life Cycle',
  'oop':  'Object-Oriented Programming',
  'fp':   'Functional Programming',
  'ddd':  'Domain-Driven Design',
  'tdd':  'Test-Driven Development',
  'bdd':  'Behavior-Driven Development',
  'aws':  'Amazon Web Services',
  'gcp':  'Google Cloud Platform',
  'k8s':  'Kubernetes',
  'ci/cd':'CI/CD',
  'gtm':  'Go-to-Market',
};

/**
 * Normalize a single keyword to its canonical ATS form.
 * Returns the input unchanged if no canonical form is known.
 */
export function normalizeKeyword(raw: string): string {
  const lower = raw.trim().toLowerCase();

  // Check abbreviation map first
  if (ABBREVIATION_MAP[lower]) return ABBREVIATION_MAP[lower];

  // Delegate skill-name normalization for tech terms
  return normalizeSkillName(raw);
}

/**
 * Normalize an array of keywords, deduplicating after normalization.
 */
export function normalizeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of keywords) {
    const normalized = normalizeKeyword(kw);
    if (!seen.has(normalized.toLowerCase())) {
      seen.add(normalized.toLowerCase());
      result.push(normalized);
    }
  }
  return result;
}

/**
 * Check if a resume's keyword is a SYNONYMIZATION of a JD keyword.
 * Returns the original JD keyword if a problematic synonym is detected.
 *
 * This is used to WARN authors, not to auto-correct.
 */
const SYNONYM_TRAPS: Array<[jdTerm: string, forbiddenSynonyms: string[]]> = [
  ['Product Lifecycle Management', ['product delivery management', 'product development cycle', 'product workflow management']],
  ['Site Reliability Engineering', ['reliability engineering', 'operations engineering']],
  ['Machine Learning', ['artificial intelligence solutions', 'ai/ml']],
  ['CI/CD', ['continuous deployment', 'build automation']],
  ['Go-to-Market', ['market launch', 'product launch strategy']],
  ['Customer Success', ['customer experience management', 'client success']],
  ['Cross-Functional Teams', ['interdepartmental teams', 'multi-team collaboration']],
];

export interface SynonymDetection {
  jdTerm:     string;
  resumeTerm: string;
}

export function detectSynonymizations(
  jdKeywords: string[],
  resumeText: string,
): SynonymDetection[] {
  const detected: SynonymDetection[] = [];
  const resumeLower = resumeText.toLowerCase();

  for (const [jdTerm, synonyms] of SYNONYM_TRAPS) {
    const jdPresent = jdKeywords.some(
      (k) => k.toLowerCase() === jdTerm.toLowerCase(),
    );
    if (!jdPresent) continue;

    // If the exact JD term is already in the resume, no problem
    if (resumeLower.includes(jdTerm.toLowerCase())) continue;

    // Check if a forbidden synonym is used instead
    for (const syn of synonyms) {
      if (resumeLower.includes(syn)) {
        detected.push({ jdTerm, resumeTerm: syn });
        break;
      }
    }
  }

  return detected;
}
