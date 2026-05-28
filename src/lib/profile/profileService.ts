import {
  ProfileScore,
  ProfileEntity,
  ProfileRecommendation,
  ProfileSummary,
} from '@/types/profile';

/** Shape of raw profile data used by local scoring helpers. */
type RawProfileData = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  professional_summary?: string;
  candidateId?: string;
  resume?: { content?: string; versions?: unknown[]; optimized?: boolean };
  skills?: Array<{ name: string; endorsed?: boolean }>;
  experience?: Array<{ title?: string; company?: string; description?: string }>;
  education?: Array<{ degree?: string; school?: string; gpa?: string | number }>;
  goals?: { desiredRoles?: unknown; desiredCompanies?: unknown; salaryRange?: unknown; geography?: unknown };
  portfolio?: unknown[];
};

/**
 * Profile Service - API client for profile operations
 * 
 * Handles:
 * - Profile data fetching and updates
 * - Completeness scoring
 * - Recommendation generation
 * - Entity extraction and management
 * - ATS optimization
 */

/**
 * Fetch complete profile summary
 */
export async function getProfileSummary(candidateId: string): Promise<ProfileSummary> {
  const res = await fetch(`/api/profile?candidateId=${candidateId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json();
}

/**
 * Fetch profile completeness score
 */
export async function getProfileScore(candidateId: string): Promise<ProfileScore> {
  const res = await fetch(`/api/profile/completeness?candidateId=${candidateId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch profile score');
  return res.json();
}

/**
 * Update profile data
 */
export async function updateProfile(
  candidateId: string,
  data: Record<string, unknown>
): Promise<unknown> {
  const res = await fetch(`/api/profile?candidateId=${candidateId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

/**
 * Generate profile recommendations based on current state
 */
export async function generateProfileRecommendations(
  candidateId: string
): Promise<ProfileRecommendation[]> {
  const res = await fetch(`/api/profile/recommendations?candidateId=${candidateId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch recommendations');
  const data = await res.json();
  return data.recommendations;
}

/**
 * Fetch all profile entities with optional filtering
 */
export async function getProfileEntities(
  candidateId: string,
  options?: {
    type?: string;
    source?: string;
    confidenceThreshold?: number;
  }
): Promise<ProfileEntity[]> {
  const params = new URLSearchParams({
    candidateId,
    ...(options?.type && { type: options.type }),
    ...(options?.source && { source: options.source }),
    ...(options?.confidenceThreshold && {
      confidence: String(options.confidenceThreshold),
    }),
  });

  const res = await fetch(`/api/profile/entities?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to fetch entities');
  const data = await res.json();
  return data.entities;
}

/**
 * Create or update a profile entity
 */
export async function saveProfileEntity(
  candidateId: string,
  entity: Omit<ProfileEntity, 'createdAt' | 'updatedAt'>
): Promise<ProfileEntity> {
  const res = await fetch(`/api/profile/entities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...entity, candidateId }),
  });

  if (!res.ok) throw new Error('Failed to save entity');
  return res.json();
}

/**
 * Delete a profile entity
 */
export async function deleteProfileEntity(entityId: string): Promise<void> {
  const res = await fetch(`/api/profile/entities/${entityId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error('Failed to delete entity');
}

/**
 * Analyze resume for ATS optimization
 */
export async function analyzeResumeForATS(
  candidateId: string,
  resumeContent: string
): Promise<{
  score: number;
  suggestions: Array<{
    category: string;
    issue: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}> {
  const res = await fetch(`/api/profile/ats-check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, resumeContent }),
  });

  if (!res.ok) throw new Error('Failed to analyze resume');
  return res.json();
}

/**
 * Generate AI career narrative
 */
export async function generateCareerNarrative(
  candidateId: string,
  focusAreas?: string[]
): Promise<string> {
  const res = await fetch(`/api/profile/narrative`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ candidateId, focusAreas }),
  });

  if (!res.ok) throw new Error('Failed to generate narrative');
  const data = await res.json();
  return data.narrative;
}

/**
 * Calculate completeness score from profile data
 */
export function calculateCompletenessScore(profile: RawProfileData): ProfileScore {
  // Scoring weights for each category
  const weights = {
    personalInfo: 0.15,
    resume: 0.25,
    skills: 0.20,
    experience: 0.15,
    education: 0.10,
    goals: 0.05,
    portfolio: 0.05,
    documents: 0.05,
  };

  // Calculate individual scores (0-100)
  const personalInfoScore = calculatePersonalInfoScore(profile);
  const resumeScore = calculateResumeScore(profile);
  const skillsScore = calculateSkillsScore(profile);
  const experienceScore = calculateExperienceScore(profile);
  const educationScore = calculateEducationScore(profile);
  const goalsScore = calculateGoalsScore(profile);
  const portfolioScore = calculatePortfolioScore(profile);

  // Calculate weighted total
  const totalScore = Math.round(
    personalInfoScore * weights.personalInfo +
      resumeScore * weights.resume +
      skillsScore * weights.skills +
      experienceScore * weights.experience +
      educationScore * weights.education +
      goalsScore * weights.goals +
      portfolioScore * weights.portfolio
  );

  return {
    id: 'score_' + Date.now(),
    candidateId: profile.candidateId ?? '',
    totalScore,
    personalInfoScore,
    resumeScore,
    skillsScore,
    experienceScore,
    educationScore,
    goalsScore,
    portfolioScore,
    completeness: totalScore / 100,
    lastUpdated: new Date(),
  };
}

function calculatePersonalInfoScore(profile: RawProfileData): number {
  let score = 0;
  if (profile.name) score += 25;
  if (profile.email) score += 25;
  if (profile.phone) score += 25;
  if (profile.location) score += 25;
  return score;
}

function calculateResumeScore(profile: RawProfileData): number {
  if (!profile.resume) return 0;
  let score = 0;
  if (profile.resume.content) score += 50;
  if (profile.resume.versions && profile.resume.versions.length > 0) score += 30;
  if (profile.resume.optimized) score += 20;
  return Math.min(score, 100);
}

function calculateSkillsScore(profile: RawProfileData): number {
  if (!profile.skills || profile.skills.length === 0) return 0;
  const count = profile.skills.length;
  const endorsed = profile.skills.filter((s) => s.endorsed).length;
  return Math.min(Math.round((count / 10) * 50 + (endorsed / count) * 50), 100);
}

function calculateExperienceScore(profile: RawProfileData): number {
  if (!profile.experience || profile.experience.length === 0) return 0;
  const count = profile.experience.length;
  const withDetails = profile.experience.filter((e) => e.description).length;
  return Math.min(Math.round((count / 5) * 50 + (withDetails / count) * 50), 100);
}

function calculateEducationScore(profile: RawProfileData): number {
  if (!profile.education || profile.education.length === 0) return 0;
  let score = 0;
  score += Math.min(profile.education.length * 25, 75);
  if (profile.education.some((e) => e.gpa)) score += 25;
  return Math.min(score, 100);
}

function calculateGoalsScore(profile: RawProfileData): number {
  if (!profile.goals) return 0;
  let score = 0;
  if (profile.goals.desiredRoles) score += 30;
  if (profile.goals.desiredCompanies) score += 30;
  if (profile.goals.salaryRange) score += 20;
  if (profile.goals.geography) score += 20;
  return Math.min(score, 100);
}

function calculatePortfolioScore(profile: RawProfileData): number {
  if (!profile.portfolio || profile.portfolio.length === 0) return 0;
  const count = profile.portfolio.length;
  return Math.min(count * 25, 100);
}

/**
 * Detect skill gaps by comparing profile to job descriptions
 */
export function detectSkillGaps(
  profile: RawProfileData,
  jobDescriptions: string[]
): {
  missingSkills: string[];
  gapLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
} {
  // Mock implementation - would use NLP/Claude in production
  const profileSkills = profile.skills?.map((s) => s.name.toLowerCase()) ?? [];
  const jobKeywords = jobDescriptions
    .join(' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 4);

  const uniqueJobSkills = Array.from(new Set(jobKeywords));
  const missingSkills = uniqueJobSkills.filter((s) => !profileSkills.includes(s));

  const gapPercent = missingSkills.length / Math.max(uniqueJobSkills.length, 1);
  const gapLevel = gapPercent > 0.5 ? 'high' : gapPercent > 0.3 ? 'medium' : 'low';

  return {
    missingSkills: missingSkills.slice(0, 5),
    gapLevel,
    recommendations: [
      `Learn ${missingSkills[0] || 'the required skills'} to improve match`,
      'Build projects showcasing target skills',
      'Take online courses in high-demand areas',
    ],
  };
}

/**
 * Format profile for ATS (Applicant Tracking System)
 */
export function formatProfileForATS(profile: RawProfileData): string {
  const sections = [
    profile.name,
    profile.email,
    profile.phone,
    profile.location,
    profile.professional_summary,
    profile.skills?.map((s) => s.name).join(', '),
    profile.experience?.map((e) => `${e.title} at ${e.company}`).join('; '),
    profile.education?.map((e) => `${e.degree} from ${e.school}`).join('; '),
  ];

  return sections.filter(Boolean).join('\n');
}

/**
 * Estimate profile improvement impact
 */
export function estimateImprovementImpact(
  current: ProfileScore,
  improvement: string
): { expectedScoreIncrease: number; estimatedTime: number } {
  // Mock calculation
  const improvements: Record<string, { increase: number; time: number }> = {
    'add_skills': { increase: 15, time: 120 },
    'tailor_resume': { increase: 10, time: 45 },
    'add_projects': { increase: 12, time: 240 },
    'complete_profile': { increase: 20, time: 60 },
  };

  const impact = improvements[improvement] || { increase: 5, time: 30 };
  return {
    expectedScoreIncrease: Math.min(current.totalScore + impact.increase, 100),
    estimatedTime: impact.time,
  };
}
