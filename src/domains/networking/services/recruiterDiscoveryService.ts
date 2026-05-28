import { createLogger } from '@/lib/logging/logger';
import { HIRING_SIGNAL_KEYWORDS } from '../constants';
import { DiscoveredRecruiter, RecruiterDiscoveryRequest } from '../types';

const logger = createLogger({ component: 'recruiter-discovery' });

// Recruiter role patterns mapped to RecruiterType enum values
const RECRUITER_ROLE_PATTERNS: Array<{ pattern: RegExp; type: string; confidence: number }> = [
  { pattern: /technical recruiter|tech recruiter|engineering recruiter/i, type: 'STAFFING_RECRUITER', confidence: 0.9 },
  { pattern: /talent acquisition|talent partner|sourcer/i, type: 'STAFFING_RECRUITER', confidence: 0.85 },
  { pattern: /internal recruiter|in-house recruiter/i, type: 'INTERNAL_RECRUITER', confidence: 0.88 },
  { pattern: /engineering manager|em\b/i, type: 'ENGINEERING_MANAGER', confidence: 0.75 },
  { pattern: /director of engineering|director, engineering/i, type: 'DIRECTOR', confidence: 0.8 },
  { pattern: /vp (of )?engineering|vice president.*engineering/i, type: 'VP', confidence: 0.82 },
];

// Team extraction patterns
const TEAM_PATTERNS = [
  /,\s*([\w\s]+)$/,           // "Senior Engineer, Platform"
  /\(([\w\s]+)\)/,            // "Senior Engineer (Infrastructure)"
  /–\s*([\w\s]+)$/,           // "Senior Engineer – Growth"
];

export class RecruiterDiscoveryService {
  async discoverRecruiters(req: RecruiterDiscoveryRequest): Promise<DiscoveredRecruiter[]> {
    logger.info({ company: req.company, jobTitle: req.jobTitle }, 'Starting recruiter discovery');

    const results: DiscoveredRecruiter[] = [];

    // Classify roles based on job title / description keywords
    const team = extractTeam(req.jobTitle);
    const hiringSignals = detectHiringSignals(req.description ?? '');

    // Generate likely recruiter profiles for the company
    const roleProfiles = generateLikelyProfiles(req.company, req.jobTitle, team);
    results.push(...roleProfiles);

    // If description contains hiring signals, add extra internal recruiter
    if (hiringSignals.length > 0) {
      results.push({
        name: `${req.company} Talent Team`,
        title: 'Technical Recruiter',
        company: req.company,
        recruiterType: 'INTERNAL_RECRUITER',
        confidenceScore: 0.7,
        discoverySource: 'hiring_signal_detection',
      });
    }

    // Deduplicate by title+company
    const seen = new Set<string>();
    const deduped = results.filter((r) => {
      const key = `${r.title}:${r.company}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    logger.info({ count: deduped.length, company: req.company }, 'Discovery complete');
    return deduped;
  }

  classifyRecruiterType(title: string): { type: string; confidence: number } | null {
    for (const { pattern, type, confidence } of RECRUITER_ROLE_PATTERNS) {
      if (pattern.test(title)) return { type, confidence };
    }
    return null;
  }

  buildLinkedInSearchQuery(req: RecruiterDiscoveryRequest): string {
    const team = extractTeam(req.jobTitle);
    const parts = [
      `site:linkedin.com/in`,
      `"${req.company}"`,
      team ? `"${team}"` : '',
      '(recruiter OR "engineering manager" OR "talent acquisition")',
    ].filter(Boolean);
    return parts.join(' ');
  }
}

function extractTeam(jobTitle: string): string | null {
  for (const pattern of TEAM_PATTERNS) {
    const match = jobTitle.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function detectHiringSignals(text: string): string[] {
  const lower = text.toLowerCase();
  return HIRING_SIGNAL_KEYWORDS.filter((kw) => lower.includes(kw));
}

function generateLikelyProfiles(
  company: string,
  jobTitle: string,
  team: string | null,
): DiscoveredRecruiter[] {
  const profiles: DiscoveredRecruiter[] = [];
  const teamSuffix = team ? `, ${team}` : '';

  // Always suggest a technical recruiter
  profiles.push({
    name: `${company} Technical Recruiter`,
    title: `Technical Recruiter${teamSuffix}`,
    company,
    recruiterType: 'INTERNAL_RECRUITER',
    confidenceScore: 0.65,
    discoverySource: 'role_classification',
  });

  // If senior/staff/lead role → suggest engineering manager
  if (/senior|staff|principal|lead/i.test(jobTitle)) {
    profiles.push({
      name: `${company} Engineering Manager`,
      title: `Engineering Manager${teamSuffix}`,
      company,
      recruiterType: 'ENGINEERING_MANAGER',
      confidenceScore: 0.72,
      discoverySource: 'role_classification',
    });
  }

  // If director/vp in title → suggest VP of Engineering
  if (/director|vp|head of/i.test(jobTitle)) {
    profiles.push({
      name: `${company} VP Engineering`,
      title: 'VP of Engineering',
      company,
      recruiterType: 'VP',
      confidenceScore: 0.68,
      discoverySource: 'role_classification',
    });
  }

  return profiles;
}

export const recruiterDiscoveryService = new RecruiterDiscoveryService();
