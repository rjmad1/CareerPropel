/**
 * Demo Data Registry
 * Shared constants and helpers for the CareerPropel demo seed/purge system.
 * All synthetic data is tagged with these identifiers for safe, idempotent purging.
 */

// ─── Core Identity ────────────────────────────────────────────────────────────

export const DEMO_EMAIL_DOMAIN = 'careerpropel.dev';
export const DEMO_EMAIL_PREFIX = 'demo+';
export const DEMO_BATCH_ID = 'demo-batch-v1.0';
export const DEMO_SEED_VERSION = '1.0.0';
export const DEMO_PURGE_GROUP = 'demo-v1';
export const DEMO_CREATED_BY = 'seed-script:seed-demo-data.ts';

export function getDemoPassword(): string {
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error('DEMO_PASSWORD must be provided and at least 12 characters for demo seeding');
  }
  return password;
}

// ─── Email Helpers ─────────────────────────────────────────────────────────────

/**
 * Returns true if the given email belongs to a demo account.
 * Demo emails follow the pattern: demo+<slug>@careerpropel.dev
 */
export function isDemoEmail(email: string): boolean {
  return (
    email.startsWith(DEMO_EMAIL_PREFIX) &&
    email.endsWith(`@${DEMO_EMAIL_DOMAIN}`)
  );
}

/**
 * Builds a demo email address from a slug.
 * e.g. demoEmail('alice') → 'demo+alice@careerpropel.dev'
 */
export function demoEmail(slug: string): string {
  return `${DEMO_EMAIL_PREFIX}${slug}@${DEMO_EMAIL_DOMAIN}`;
}

// ─── Metadata Helpers ──────────────────────────────────────────────────────────

/**
 * Returns a standard demo metadata block to embed in any Json? field.
 * Use this in: preferences, metadata, details, content, data fields.
 */
export function demoMeta(extras?: Record<string, unknown>): Record<string, unknown> {
  return {
    _demo: true,
    _is_demo_data: true,
    _batch_id: DEMO_BATCH_ID,
    _seed_version: DEMO_SEED_VERSION,
    _purge_group: DEMO_PURGE_GROUP,
    _created_by: DEMO_CREATED_BY,
    _synthetic_origin: 'seed-demo-data',
    _synthetic_created_at: new Date().toISOString(),
    ...extras,
  };
}

/**
 * Returns candidate preferences JSON with demo metadata embedded.
 */
export function demoPreferences(
  theme: 'light' | 'dark' | 'system' = 'system',
  emailNotifications = true,
  extras?: Record<string, unknown>
): Record<string, unknown> {
  return {
    theme,
    emailNotifications,
    ...demoMeta(extras),
  };
}

// ─── Deterministic Randomness ──────────────────────────────────────────────────

/**
 * Mulberry32 seeded pseudo-random number generator.
 * Produces identical sequences for identical seeds — ensures deterministic data generation.
 * Usage: const rand = seededRng(42); const n = rand(); // 0..1
 */
export function seededRng(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Picks a random element from an array using the provided rng.
 */
export function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Picks N unique random elements from an array.
 */
export function pickN<T>(arr: T[], n: number, rng: () => number): T[] {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Returns a random integer in [min, max] inclusive.
 */
export function randInt(min: number, max: number, rng: () => number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * Returns a date offset by `daysAgo` from today.
 */
export function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Returns a date in the future by `daysAhead`.
 */
export function daysAhead(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// ─── Profile Size Config ──────────────────────────────────────────────────────

export type SeedProfile = 'small' | 'medium' | 'enterprise' | 'stress-test';

export interface ProfileConfig {
  candidatesPerArchetype: number;
  jobsPerCandidate: number;
  interviewsPerJob: number;
  offersPerCandidate: number;
  documentsPerCandidate: number;
  calendarEventsPerCandidate: number;
  agentExecutionsPerCandidate: number;
  auditLogsPerCandidate: number;
}

export const PROFILE_CONFIGS: Record<SeedProfile, ProfileConfig> = {
  small: {
    candidatesPerArchetype: 1,
    jobsPerCandidate: 8,
    interviewsPerJob: 2,
    offersPerCandidate: 1,
    documentsPerCandidate: 4,
    calendarEventsPerCandidate: 3,
    agentExecutionsPerCandidate: 3,
    auditLogsPerCandidate: 10,
  },
  medium: {
    candidatesPerArchetype: 2,
    jobsPerCandidate: 20,
    interviewsPerJob: 3,
    offersPerCandidate: 3,
    documentsPerCandidate: 10,
    calendarEventsPerCandidate: 8,
    agentExecutionsPerCandidate: 8,
    auditLogsPerCandidate: 25,
  },
  enterprise: {
    candidatesPerArchetype: 5,
    jobsPerCandidate: 50,
    interviewsPerJob: 4,
    offersPerCandidate: 6,
    documentsPerCandidate: 20,
    calendarEventsPerCandidate: 15,
    agentExecutionsPerCandidate: 15,
    auditLogsPerCandidate: 50,
  },
  'stress-test': {
    candidatesPerArchetype: 17, // ~100 total across 6 archetypes
    jobsPerCandidate: 100,
    interviewsPerJob: 5,
    offersPerCandidate: 10,
    documentsPerCandidate: 40,
    calendarEventsPerCandidate: 30,
    agentExecutionsPerCandidate: 25,
    auditLogsPerCandidate: 100,
  },
};

// ─── Candidate Archetypes ─────────────────────────────────────────────────────

export type CandidateArchetype =
  | 'job_seeker_senior'
  | 'job_seeker_mid'
  | 'job_seeker_entry'
  | 'recruiter'
  | 'hiring_manager'
  | 'coordinator';

export const ARCHETYPES: CandidateArchetype[] = [
  'job_seeker_senior',
  'job_seeker_mid',
  'job_seeker_entry',
  'recruiter',
  'hiring_manager',
  'coordinator',
];

// ─── Job Pipeline Stages ──────────────────────────────────────────────────────

export const JOB_STAGES = [
  'sourced',
  'interested',
  'resume_tailoring',
  'applied',
  'recruiter_screen',
  'hiring_manager',
  'technical_interview',
  'system_design',
  'behavioral',
  'final_round',
  'offer',
  'negotiation',
  'rejected',
  'archived',
] as const;

export type JobStage = typeof JOB_STAGES[number];

// ─── Interview Types ───────────────────────────────────────────────────────────

export const INTERVIEW_TYPES = [
  'phone',
  'video',
  'onsite',
  'panel',
  'technical',
  'behavioral',
] as const;

// ─── Offer Statuses ────────────────────────────────────────────────────────────

export const OFFER_STATUSES = [
  'pending',
  'received',
  'accepted',
  'rejected',
  'negotiating',
] as const;

// ─── Document Types ────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES = [
  'resume',
  'cover_letter',
  'pdf',
  'notes',
  'offer_letter',
  'linkedin_export',
] as const;
