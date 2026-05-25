/**
 * Master Profile Normalizer
 *
 * Deduplicates and normalizes raw career data before assembly into
 * the canonical MasterProfile. Key responsibilities:
 *  - Merge semantically equivalent skills
 *  - Classify bullet strength
 *  - Remove vague/filler language
 *  - Compute career metadata (years exp, level, industries)
 */

import crypto from 'crypto';
import type {
  MasterSkill,
  MasterRole,
  MasterBullet,
  MasterAccomplishment,
  NormalizationReport,
} from './types';

// ─── Skill Normalization ──────────────────────────────────────────────────────

/** Canonical skill name → known aliases mapping */
const SKILL_ALIASES: Record<string, string[]> = {
  TypeScript:   ['ts', 'typescript'],
  JavaScript:   ['js', 'javascript', 'es6', 'es2015', 'ecmascript'],
  PostgreSQL:   ['postgres', 'pg', 'postgresql'],
  React:        ['reactjs', 'react.js'],
  'Node.js':    ['node', 'nodejs', 'node js'],
  'Next.js':    ['nextjs', 'next js'],
  Kubernetes:   ['k8s'],
  Docker:       ['docker'],
  GraphQL:      ['gql'],
  'CI/CD':      ['continuous integration', 'continuous delivery', 'cicd'],
  AWS:          ['amazon web services', 'amazon aws'],
  GCP:          ['google cloud', 'google cloud platform'],
  Azure:        ['microsoft azure'],
  Redis:        ['redis cache'],
  MongoDB:      ['mongo'],
  Python:       ['py', 'python3'],
  'Machine Learning': ['ml', 'machine-learning'],
  'Product Lifecycle Management': ['plm', 'product lifecycle mgmt'],
};

/** Normalize a skill name to its canonical form */
export function normalizeSkillName(raw: string): string {
  const lower = raw.trim().toLowerCase();
  for (const [canonical, aliases] of Object.entries(SKILL_ALIASES)) {
    if (aliases.includes(lower) || canonical.toLowerCase() === lower) {
      return canonical;
    }
  }
  // Title-case the raw if no canonical found
  return raw.trim().replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Deduplicate skills, merging aliases under canonical names */
export function deduplicateSkills(skills: MasterSkill[]): {
  skills: MasterSkill[];
  merged: number;
} {
  const canonicalMap = new Map<string, MasterSkill>();

  for (const skill of skills) {
    const canonical = normalizeSkillName(skill.name);
    if (canonicalMap.has(canonical)) {
      const existing = canonicalMap.get(canonical)!;
      // Merge: keep highest proficiency, latest lastUsed, union aliases
      const proficiencyRank = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
      if (proficiencyRank[skill.proficiency] > proficiencyRank[existing.proficiency]) {
        existing.proficiency = skill.proficiency;
      }
      if (skill.lastUsed && (!existing.lastUsed || skill.lastUsed > existing.lastUsed)) {
        existing.lastUsed = skill.lastUsed;
      }
      const alias = skill.name.toLowerCase();
      if (!existing.aliases.includes(alias)) existing.aliases.push(alias);
    } else {
      canonicalMap.set(canonical, { ...skill, name: canonical });
    }
  }

  const merged = skills.length - canonicalMap.size;
  return { skills: Array.from(canonicalMap.values()), merged };
}

// ─── Bullet Validation + Classification ──────────────────────────────────────

/** Patterns that indicate weak, vague, or filler bullet content */
const WEAK_PATTERNS = [
  /^(results[- ]driven|hardworking|team player|go[- ]getter|responsible for|helped|assisted|worked on)/i,
  /^(participated in|involved in|contributed to|supported|was responsible)/i,
  /improved (things|outcomes|results|performance)\s*$/i,
  /^(managed|handled|dealt with)\s+\w+\s*$/i, // "managed tasks" with no scope
];

/** Strong action verbs that signal quantified impact */
const STRONG_ACTION_VERBS = [
  'Reduced', 'Increased', 'Grew', 'Saved', 'Generated', 'Delivered', 'Launched',
  'Built', 'Designed', 'Architected', 'Led', 'Directed', 'Owned', 'Scaled',
  'Optimized', 'Automated', 'Deployed', 'Refactored', 'Migrated', 'Consolidated',
  'Established', 'Created', 'Developed', 'Implemented', 'Spearheaded',
  'Negotiated', 'Secured', 'Recruited', 'Mentored', 'Trained',
];

const METRIC_PATTERN = /\d+(\.\d+)?(%|x|\$|M|K|ms|s\b|\+|\-)/;

export function classifyBulletStrength(
  text: string,
): 'strong' | 'moderate' | 'weak' {
  // Weak: matches vague patterns
  if (WEAK_PATTERNS.some((p) => p.test(text))) return 'weak';

  // Strong: starts with strong verb AND contains a metric
  const startsStrong = STRONG_ACTION_VERBS.some((v) =>
    text.startsWith(v) || new RegExp(`^${v}[^a-z]`, 'i').test(text),
  );
  const hasMetric = METRIC_PATTERN.test(text);

  if (startsStrong && hasMetric) return 'strong';
  if (startsStrong || hasMetric) return 'moderate';
  return 'weak';
}

export function parseBullet(id: string, text: string, skills: string[] = []): MasterBullet {
  const strength = classifyBulletStrength(text);
  const isQuantified = METRIC_PATTERN.test(text);

  // Extract action verb (first word)
  const action = text.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') ?? '';

  // Heuristic: metric is a number+unit sequence
  const metricMatch = text.match(/\d+(\.\d+)?(%|x|\$[0-9MK]+|[0-9]+[MK]|ms|\+)/);
  const metric = metricMatch ? metricMatch[0] : undefined;

  // Keywords: capitalized multi-word phrases and known skills
  const keywords = [
    ...skills,
    ...(text.match(/[A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*/g) ?? []),
  ].filter((k, i, a) => a.indexOf(k) === i);

  return {
    id,
    text,
    action,
    metric,
    strength,
    isQuantified,
    skills,
    keywords,
  };
}

// ─── Career Level Estimation ──────────────────────────────────────────────────

export function estimateCareerLevel(
  yearsExp: number,
  titles: string[],
): MasterRole['bullets'][0]['strength'] extends infer _ ? 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive' : never {
  const titleConcat = titles.join(' ').toLowerCase();
  if (/\b(cto|ceo|cpo|vp|vice president|chief|svp|evp)\b/.test(titleConcat)) return 'executive';
  if (/\b(principal|distinguished|fellow)\b/.test(titleConcat)) return 'principal';
  if (/\b(staff|lead|architect)\b/.test(titleConcat)) return 'staff';
  if (/\b(senior|sr\.?)\b/.test(titleConcat) || yearsExp >= 7) return 'senior';
  if (yearsExp >= 3) return 'mid';
  return 'entry';
}

// ─── Top Skills Selection ─────────────────────────────────────────────────────

export function selectTopSkills(skills: MasterSkill[], limit = 16): string[] {
  const proficiencyScore = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
  return skills
    .slice()
    .sort((a, b) => {
      const pDiff = proficiencyScore[b.proficiency] - proficiencyScore[a.proficiency];
      if (pDiff !== 0) return pDiff;
      // Tie-break by recency
      const aDate = a.lastUsed ?? '2000-01';
      const bDate = b.lastUsed ?? '2000-01';
      return bDate.localeCompare(aDate);
    })
    .slice(0, limit)
    .map((s) => s.name);
}

// ─── Profile Version Hash ─────────────────────────────────────────────────────

/** Deterministic SHA-256 hash of the profile content for provenance tracking */
export function computeProfileHash(candidateId: string, data: unknown): string {
  const payload = JSON.stringify({ candidateId, data });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

// ─── Accomplishment Normalization ─────────────────────────────────────────────

export function normalizeAccomplishments(
  raw: Array<{
    id: string;
    title: string;
    description: string;
    metrics?: string | null;
    starContext?: string | null;
    category: string;
  }>,
): MasterAccomplishment[] {
  return raw.map((a) => {
    // Parse STAR context if available
    let action = '';
    let scope = '';
    let result = a.description;
    let metric: string | undefined;

    if (a.starContext) {
      try {
        const star = typeof a.starContext === 'string'
          ? JSON.parse(a.starContext)
          : a.starContext;
        action = star.action ?? '';
        scope  = star.task ?? star.scope ?? '';
        result = star.result ?? a.description;
      } catch { /* ignore malformed STAR */ }
    }

    if (a.metrics) {
      const metricMatch = a.metrics.match(/\d+(\.\d+)?(%|x|\$[0-9MKB]+|[0-9]+[MKB])/);
      metric = metricMatch ? metricMatch[0] : a.metrics.slice(0, 50);
    }

    if (!action) action = a.title.split(/\s+/)[0] ?? 'Delivered';
    if (!scope)  scope  = a.title;

    return {
      id: a.id,
      action,
      scope,
      result,
      metric,
      evidence:          undefined,
      category:          a.category,
      function:          undefined,
      industry:          undefined,
      domain:            undefined,
      competency:        undefined,
      operationalScale:  undefined,
      associatedSkills:  [],
      associatedRoles:   [],
      associatedTools:   [],
      isVerified:        false,
    };
  });
}

// ─── Normalization orchestrator ───────────────────────────────────────────────

export function runNormalizationReport(
  rawSkillCount: number,
  mergedCount: number,
  weakBullets: string[],
): NormalizationReport {
  return {
    duplicatesRemoved:    mergedCount,
    skillsNormalized:     rawSkillCount,
    bulletsStrengthened:  0,
    weakBulletsRejected:  weakBullets,
    warnings:             weakBullets.length
      ? [`${weakBullets.length} weak bullets excluded from canonical profile`]
      : [],
  };
}
