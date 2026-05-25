/**
 * Top-Third Optimizer
 *
 * The first ~33% of a resume is where ATS systems and recruiters apply the
 * most weight. This module dynamically reorders and assembles the top-third
 * to maximize both ATS keyword density and recruiter skim efficiency.
 *
 * Prioritization order:
 *  1. Exact target job title
 *  2. ATS keywords from JD
 *  3. Core technical skills aligned to role
 *  4. Top 2–3 quantified achievements
 *  5. Years of experience + industry domain
 */

import type { MasterProfile } from '../profile/master-profile/types';
import type { ExtractedKeywords } from '../ats/keywordExtractor';

export interface TopThirdSection {
  /** Rendered Markdown for the top-third block */
  content:    string;
  /** Keywords successfully placed in this section */
  placed:     string[];
  /** Score 0–100 for how well this section serves ATS + recruiter needs */
  score:      number;
}

// ─── Summary assembler ────────────────────────────────────────────────────────

function buildTargetedSummary(
  profile: MasterProfile,
  targetRole: string,
  jdKeywords: ExtractedKeywords,
  targetCompany?: string,
): string {
  const yearsRounded = Math.floor(profile.totalYearsExperience);
  const topIndustry  = profile.primaryIndustries[0] ?? 'technology';

  // Include up to 3 JD title keywords naturally
  const titleKeywords = jdKeywords.title.slice(0, 3).join(', ');

  const companyRef = targetCompany ? ` for ${targetCompany}` : '';

  return (
    `${targetRole} with ${yearsRounded}+ years of experience in ${topIndustry}. ` +
    `Proven track record in ${titleKeywords || 'cross-functional leadership and delivery'}. ` +
    `${profile.professionalSummary}`
  ).trim();
}

// ─── Skills section ───────────────────────────────────────────────────────────

function buildSkillsSection(
  profileSkills: string[],
  jdKeywords: ExtractedKeywords,
  limit = 16,
): { section: string; placed: string[] } {
  const placed: string[] = [];

  // Priority order: JD required → JD preferred → profile top skills
  const prioritized = [
    ...jdKeywords.required.filter((k) =>
      profileSkills.some((s) => s.toLowerCase() === k.toLowerCase()),
    ),
    ...jdKeywords.preferred.filter((k) =>
      profileSkills.some((s) => s.toLowerCase() === k.toLowerCase()),
    ),
    ...profileSkills,
  ].reduce<string[]>((acc, s) => {
    if (!acc.some((a) => a.toLowerCase() === s.toLowerCase())) acc.push(s);
    return acc;
  }, []).slice(0, limit);

  // Track JD keywords successfully placed
  for (const sk of prioritized) {
    if (jdKeywords.all.some((k) => k.toLowerCase() === sk.toLowerCase())) {
      placed.push(sk);
    }
  }

  const section =
    `## Skills\n\n` +
    prioritized.map((s) => `- ${s}`).join('\n');

  return { section, placed };
}

// ─── Top achievements ─────────────────────────────────────────────────────────

function pickTopAchievements(
  profile: MasterProfile,
  jdKeywords: ExtractedKeywords,
  count = 3,
): string[] {
  // Score each accomplishment by keyword overlap + metric presence
  const scored = profile.accomplishments
    .filter((a) => a.metric)
    .map((acc) => {
      const text = [acc.action, acc.scope, acc.result].join(' ').toLowerCase();
      const overlap = jdKeywords.all.filter((k) =>
        text.includes(k.toLowerCase()),
      ).length;
      return { acc, score: overlap };
    })
    .sort((a, b) => b.score - a.score);

  // Fallback to strong bullets from experience
  const bestBullets: string[] = [];
  for (const role of profile.roles) {
    for (const bullet of role.bullets) {
      if (bullet.strength === 'strong') bestBullets.push(bullet.text);
    }
  }

  const achText = scored
    .slice(0, count)
    .map((s) => `${s.acc.action} ${s.acc.scope} — ${s.acc.result}${s.acc.metric ? ` (${s.acc.metric})` : ''}`)
    .concat(bestBullets)
    .slice(0, count);

  return achText;
}

// ─── Top-third score ──────────────────────────────────────────────────────────

function scoreTopThird(placed: string[], jdRequired: string[]): number {
  if (jdRequired.length === 0) return 80; // no JD to compare against
  const coverage = placed.filter((k) =>
    jdRequired.some((r) => r.toLowerCase() === k.toLowerCase()),
  ).length;
  return Math.min(100, Math.round((coverage / jdRequired.length) * 100));
}

// ─── Main optimizer ───────────────────────────────────────────────────────────

export function optimizeTopThird(
  profile: MasterProfile,
  targetRole: string,
  jdKeywords: ExtractedKeywords,
  targetCompany?: string,
): TopThirdSection {
  const summary = buildTargetedSummary(profile, targetRole, jdKeywords, targetCompany);
  const { section: skillsSection, placed: skillsPlaced } = buildSkillsSection(
    profile.topSkills,
    jdKeywords,
  );
  const topAchievements = pickTopAchievements(profile, jdKeywords);

  const achievementsSection =
    topAchievements.length > 0
      ? `## Key Achievements\n\n${topAchievements.map((a) => `- ${a}`).join('\n')}`
      : '';

  const content = [
    `## Professional Summary\n\n${summary}`,
    skillsSection,
    achievementsSection,
  ]
    .filter(Boolean)
    .join('\n\n');

  // Track all JD keywords placed in this block
  const placedInSummary = jdKeywords.all.filter((k) =>
    summary.toLowerCase().includes(k.toLowerCase()),
  );
  const placed = [...new Set([...placedInSummary, ...skillsPlaced])];

  const score = scoreTopThird(placed, jdKeywords.required);

  return { content, placed, score };
}
