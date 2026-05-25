/**
 * Canonical Career Master Profile — type definitions.
 *
 * All downstream document generation MUST consume these normalized types.
 * No generator may read raw ProfileData, uploaded resumes, or unprocessed
 * profile entities directly.
 */

// ─── Core Career Building Blocks ─────────────────────────────────────────────

export interface MasterSkill {
  name: string;           // canonical name, e.g. "PostgreSQL"
  aliases: string[];      // alternate spellings found in raw data
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  lastUsed?: string;      // ISO date
  category: string;       // "language" | "framework" | "tool" | "cloud" | "methodology" | "domain"
}

export interface MasterRole {
  title: string;          // canonical job title
  company: string;
  location?: string;
  startDate: string;      // YYYY-MM or YYYY-MM-DD
  endDate?: string;       // omit if current
  isCurrent: boolean;
  bullets: MasterBullet[];
  skills: string[];       // skill names used in this role
  industry?: string;
}

export interface MasterBullet {
  id: string;             // stable ID for variant assembly
  text: string;           // full bullet text
  action: string;         // leading action verb
  scope?: string;
  result?: string;
  metric?: string;
  strength: 'strong' | 'moderate' | 'weak'; // post-validation classification
  skills: string[];       // associated skill names
  keywords: string[];     // significant keywords
  isQuantified: boolean;
}

export interface MasterEducation {
  degree: string;
  field: string;
  institution: string;
  graduationYear?: number;
  gpa?: number;
  honors?: string;
}

export interface MasterCertification {
  name: string;
  issuer: string;
  issuedDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface MasterProject {
  name: string;
  description: string;
  skills: string[];
  outcomes?: string[];
  url?: string;
  period?: string;
}

// ─── STAR Story ──────────────────────────────────────────────────────────────

export interface MasterStarStory {
  id: string;
  competency: string;
  additionalCompetencies: string[];
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  skills: string[];
  interviewQuestions: string[];
  relevanceScore: number;
}

// ─── Canonical Profile ────────────────────────────────────────────────────────

export interface MasterProfile {
  /** Candidate DB id — links back to the source of truth */
  candidateId: string;

  /** Deterministic hash of the profile content — used for variant provenance */
  profileVersionHash: string;

  /** When this master profile was assembled */
  assembledAt: string;

  // Identity
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;

  // Narrative
  professionalSummary: string;

  // Career history (chronological, most-recent first)
  roles: MasterRole[];

  // Skills inventory (deduplicated, normalized)
  skills: MasterSkill[];

  // Accomplishment bank items (structured evidence)
  accomplishments: MasterAccomplishment[];

  // Education
  education: MasterEducation[];

  // Certifications
  certifications: MasterCertification[];

  // Projects
  projects: MasterProject[];

  // STAR stories
  starStories: MasterStarStory[];

  // Computed metadata
  totalYearsExperience: number;
  primaryIndustries: string[];
  topSkills: string[];         // top ~16 by proficiency + recency
  careerLevel: 'entry' | 'mid' | 'senior' | 'staff' | 'principal' | 'executive';
}

// ─── Accomplishment (structured, evidence-backed) ─────────────────────────────

export interface MasterAccomplishment {
  id: string;
  action: string;
  scope: string;
  result: string;
  metric?: string;
  evidence?: string;
  category: string;
  function?: string;
  industry?: string;
  domain?: string;
  competency?: string;
  operationalScale?: string;
  associatedSkills: string[];
  associatedRoles: string[];
  associatedTools: string[];
  isVerified: boolean;
}

// ─── Normalization diff ───────────────────────────────────────────────────────

export interface NormalizationReport {
  duplicatesRemoved: number;
  skillsNormalized: number;
  bulletsStrengthened: number;
  weakBulletsRejected: string[];
  warnings: string[];
}
