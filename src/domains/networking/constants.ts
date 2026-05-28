export const RELATIONSHIP_SCORE_WEIGHTS = {
  hiringAuthority: 0.25,
  roleAlignment: 0.20,
  mutualConnections: 0.15,
  recruiterSpecialization: 0.15,
  responseProbability: 0.10,
  companyInfluence: 0.10,
  activityRecency: 0.05,
} as const;

export const OUTREACH_RATE_LIMITS = {
  maxPerDay: 5,
  maxPerWeek: 20,
  maxPerContact: 4,
  minDaysBetweenFollowups: 3,
  sequenceDelays: [0, 3, 7, 14], // days after initial contact
} as const;

export const SAFETY_RULES = [
  'NO_GENERIC_OPENER',
  'NO_HALLUCINATED_REFS',
  'NO_FABRICATED_REFERRALS',
  'REQUIRE_HUMAN_APPROVAL',
  'RESPECT_RATE_LIMITS',
] as const;

export const QUEUE_NAMES = {
  NETWORKING_DISCOVERY: 'networking-discovery',
  NETWORKING_ENRICHMENT: 'networking-enrichment',
  OUTREACH_GENERATION: 'outreach-generation',
  FOLLOWUP_ORCHESTRATION: 'followup-orchestration',
  ENGAGEMENT_TRACKING: 'engagement-tracking',
} as const;

export const SENIORITY_AUTHORITY_SCORES: Record<string, number> = {
  C_LEVEL: 1.0,
  VP: 0.9,
  DIRECTOR: 0.8,
  LEAD: 0.6,
  SENIOR: 0.5,
  MID: 0.35,
  JUNIOR: 0.2,
};

export const HIRING_SIGNAL_KEYWORDS = [
  'hiring',
  'recruiting',
  'talent acquisition',
  'head of engineering',
  'vp engineering',
  'engineering manager',
  'technical recruiter',
  'sourcer',
  'talent partner',
  'people operations',
];

export const SENIORITY_KEYWORDS: Record<string, string[]> = {
  C_LEVEL: ['cto', 'ceo', 'cpo', 'chief', 'founder', 'co-founder'],
  VP: ['vp', 'vice president', 'svp', 'evp'],
  DIRECTOR: ['director', 'head of'],
  LEAD: ['lead', 'principal', 'staff'],
  SENIOR: ['senior', 'sr.', 'sr '],
  MID: ['mid', 'ii', 'iii', 'ii ', ' ii'],
  JUNIOR: ['junior', 'jr.', 'jr ', 'associate', 'entry'],
};

export const GENERIC_OPENER_PATTERNS = [
  /hi \[name\]/i,
  /hello \[name\]/i,
  /i saw your profile/i,
  /i came across your profile/i,
  /i noticed your profile/i,
  /hope this (finds|message)/i,
  /i hope you.re doing well/i,
  /i wanted to reach out to you/i,
];

export const MIN_WARM_PATH_CONFIDENCE = 0.6;
