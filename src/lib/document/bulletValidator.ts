/**
 * Bullet Validator
 *
 * Enforces the rule: Action Verb → Scope → Result → Metric.
 * Rejects vague, filler, or duty-listing bullets.
 * Every bullet that passes this validator is safe for ATS + recruiter review.
 */

export type BulletValidationStatus = 'strong' | 'moderate' | 'weak' | 'rejected';

export interface BulletValidationResult {
  original:   string;
  status:     BulletValidationStatus;
  issues:     string[];
  suggestion?: string;
}

// ─── Rejection criteria ───────────────────────────────────────────────────────

const REJECTED_STARTS = [
  /^(results[- ]driven|hardworking|team player|go[- ]getter|self[- ]motivated)/i,
  /^(responsible for|helped|assisted|worked on|participated in)/i,
  /^(involved in|contributed to|supported|was responsible)/i,
  /^(good at|excellent|proficient in|familiar with)/i,
  /^(duties included|duties:|responsibilities:)/i,
];

const REJECTED_PHRASES = [
  /\b(detail[- ]oriented|results[- ]driven|self[- ]starter|team player|hard[\s-]working)\b/i,
  /\b(excellent communication|strong work ethic|go[\s-]getter|out[\s-]of[\s-]the[\s-]box)\b/i,
];

// ─── Strength signals ─────────────────────────────────────────────────────────

const STRONG_VERBS = new Set([
  'Reduced', 'Increased', 'Grew', 'Saved', 'Generated', 'Delivered', 'Launched',
  'Built', 'Designed', 'Architected', 'Led', 'Directed', 'Owned', 'Scaled',
  'Optimized', 'Automated', 'Deployed', 'Refactored', 'Migrated', 'Consolidated',
  'Established', 'Created', 'Developed', 'Implemented', 'Spearheaded',
  'Negotiated', 'Secured', 'Recruited', 'Mentored', 'Trained', 'Coached',
  'Streamlined', 'Accelerated', 'Eliminated', 'Improved', 'Transformed',
  'Resolved', 'Shipped', 'Contributed', 'Authored', 'Engineered',
  'Onboarded', 'Audited', 'Forecasted', 'Restructured', 'Partnered',
]);

const METRIC_PATTERN = /\d+(\.\d+)?(%|x|\$[0-9,]+|[0-9]+[MKB]|\s*(million|thousand|billion)|ms\b|\s*(hours?|days?|weeks?|months?|users?|customers?|teams?))/i;

// ─── Validator ────────────────────────────────────────────────────────────────

export function validateBullet(bullet: string): BulletValidationResult {
  const trimmed = bullet.trim().replace(/^[-•*]\s*/, '');
  const issues: string[] = [];

  // Hard rejection
  for (const pattern of REJECTED_STARTS) {
    if (pattern.test(trimmed)) {
      return {
        original: bullet,
        status:   'rejected',
        issues:   [`Starts with filler/vague phrase. Rewrite as: Action Verb → Scope → Result → Metric.`],
        suggestion: 'Example: "Reduced onboarding time by 40% by automating approval workflows for 12 teams."',
      };
    }
  }
  for (const pattern of REJECTED_PHRASES) {
    if (pattern.test(trimmed)) {
      issues.push('Contains generic filler phrase — replace with specific evidence.');
    }
  }

  // Action verb check
  const firstWord = trimmed.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, '') ?? '';
  const hasStrongVerb = STRONG_VERBS.has(firstWord);
  if (!hasStrongVerb) {
    issues.push(`Weak start: "${firstWord}" — use a strong action verb (Built, Reduced, Led, etc.)`);
  }

  // Metric check
  const hasMetric = METRIC_PATTERN.test(trimmed);
  if (!hasMetric) {
    issues.push('No quantifiable metric — add a number, percentage, or scale indicator.');
  }

  // Length check
  const words = trimmed.split(/\s+/).length;
  if (words < 8) {
    issues.push('Too short — expand with scope and result.');
  } else if (words > 35) {
    issues.push('Too long — trim to under 35 words for recruiter skim efficiency.');
  }

  // Determine status
  let status: BulletValidationStatus;
  if (issues.length === 0) {
    status = 'strong';
  } else if (issues.length <= 1 && hasStrongVerb) {
    status = 'moderate';
  } else if (issues.some((i) => i.includes('filler'))) {
    status = 'rejected';
  } else {
    status = 'weak';
  }

  return { original: bullet, status, issues };
}

export function validateBullets(bullets: string[]): {
  results:       BulletValidationResult[];
  strongCount:   number;
  moderateCount: number;
  weakCount:     number;
  rejectedCount: number;
  overallScore:  number;
} {
  const results = bullets.map(validateBullet);
  const strongCount   = results.filter((r) => r.status === 'strong').length;
  const moderateCount = results.filter((r) => r.status === 'moderate').length;
  const weakCount     = results.filter((r) => r.status === 'weak').length;
  const rejectedCount = results.filter((r) => r.status === 'rejected').length;

  // Score: strong=10, moderate=6, weak=3, rejected=0 — normalized to 100
  const rawScore  = strongCount * 10 + moderateCount * 6 + weakCount * 3;
  const maxScore  = bullets.length * 10;
  const overallScore = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

  return { results, strongCount, moderateCount, weakCount, rejectedCount, overallScore };
}
