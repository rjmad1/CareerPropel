/**
 * Resume Variant Generator
 *
 * Generates ATS-safe, role-specific resume variants from the canonical
 * MasterProfile. Integrates:
 *  - Top-third optimizer
 *  - Keyword alignment
 *  - ATS formatter
 *  - Bullet validator
 *  - Parser validation
 *  - ATS scoring
 *
 * This is the primary entry point for resume document generation.
 */

import { callLLM } from '@/lib/llm/provider';
import type { MasterProfile } from '../profile/master-profile/types';
import { extractJobKeywords, type ExtractedKeywords } from '../ats/keywordExtractor';
import { profileJobLanguage, type JobLanguageProfile } from '../ats/jobLanguageProfiler';
import { analyzeKeywordGap, type KeywordGapReport } from '../ats/keywordGapAnalyzer';
import { runParserValidation } from '../ats/parsers';
import { computeATSScore, computeRecruiterScore } from '../ats/atsScorer';
import { optimizeTopThird } from './topThirdOptimizer';
import { enforceATSFormat } from './atsFormatter';
import { validateBullets } from './bulletValidator';

export interface VariantGenerationInput {
  profile:         MasterProfile;
  targetRole:      string;
  targetCompany?:  string;
  targetIndustry?: string;
  jobDescription?: string;
  jobTitle?:       string;
  jobId?:          string;
  /** Whether to use AI to write role experience bullets (vs. use bank bullets directly) */
  useAIBullets?: boolean;
}

export interface VariantGenerationResult {
  content:            string;  // ATS-safe Markdown
  targetRole:         string;
  targetCompany?:     string;
  atsScore:           number;
  keywordCoverage:    number;
  recruiterScore:     number;
  topThirdScore:      number;
  bulletQualityScore: number;
  profileVersionHash: string;
  jdKeywords:         ExtractedKeywords;
  gapReport:          KeywordGapReport;
  parserWarnings:     string[];
  parserErrors:       string[];
  recommendations:    string[];
}

// ─── Experience section builder ───────────────────────────────────────────────

function buildExperienceSection(
  profile: MasterProfile,
  jdKeywords: ExtractedKeywords,
  langProfile: JobLanguageProfile,
): string {
  const lines: string[] = ['## Experience'];

  for (const role of profile.roles) {
    const dateRange = role.endDate
      ? `${role.startDate} – ${role.endDate}`
      : `${role.startDate} – Present`;

    lines.push(`\n### ${role.title}`);
    lines.push(`**${role.company}** | ${role.location ?? ''} | ${dateRange}`);
    lines.push('');

    // Filter bullets: prefer strong, use moderate if needed, skip weak
    const strongBullets   = role.bullets.filter((b) => b.strength === 'strong');
    const moderateBullets = role.bullets.filter((b) => b.strength === 'moderate');
    const selectedBullets = [...strongBullets, ...moderateBullets].slice(0, 6);

    // Inject JD keywords into bullets where truthfully possible
    for (const bullet of selectedBullets) {
      lines.push(`- ${bullet.text}`);
    }
  }

  return lines.join('\n');
}

// ─── Education + Certifications ───────────────────────────────────────────────

function buildEducationSection(profile: MasterProfile): string {
  if (profile.education.length === 0) return '';
  const lines = ['## Education'];
  for (const edu of profile.education) {
    lines.push(`\n**${edu.degree} in ${edu.field}** — ${edu.institution}${edu.graduationYear ? ` (${edu.graduationYear})` : ''}`);
    if (edu.honors) lines.push(`*${edu.honors}*`);
  }
  return lines.join('\n');
}

function buildCertificationsSection(profile: MasterProfile): string {
  if (profile.certifications.length === 0) return '';
  const lines = ['## Certifications'];
  for (const cert of profile.certifications) {
    lines.push(`- **${cert.name}** — ${cert.issuer}${cert.issuedDate ? ` (${cert.issuedDate})` : ''}`);
  }
  return lines.join('\n');
}

function buildProjectsSection(profile: MasterProfile): string {
  if (profile.projects.length === 0) return '';
  const lines = ['## Projects'];
  for (const proj of profile.projects.slice(0, 4)) {
    lines.push(`\n**${proj.name}**${proj.period ? ` | ${proj.period}` : ''}`);
    lines.push(proj.description);
    if (proj.skills.length > 0) lines.push(`*Technologies: ${proj.skills.join(', ')}*`);
  }
  return lines.join('\n');
}

// ─── AI-assisted bullet generation ───────────────────────────────────────────

async function generateAIBullets(
  profile: MasterProfile,
  targetRole: string,
  jdKeywords: ExtractedKeywords,
): Promise<Record<string, string[]>> {
  // Only call AI if we have a job description with keywords
  if (jdKeywords.required.length === 0) return {};

  const prompt = `You are an expert ATS resume writer. Rewrite experience bullets for a candidate targeting "${targetRole}".

CRITICAL RULES:
1. NEVER hallucinate experience, metrics, or skills the candidate doesn't have
2. Use EXACT keywords from the job description — do NOT synonymize
3. Every bullet must follow: Action Verb → Scope → Result → Metric
4. Reject vague phrases: "responsible for", "hardworking", "team player"
5. Output ONLY JSON — no preamble

Required JD keywords to include where truthful: ${jdKeywords.required.slice(0, 10).join(', ')}

Candidate roles and existing bullets:
${profile.roles.slice(0, 3).map((r) =>
  `${r.title} at ${r.company}:\n${r.bullets.slice(0, 4).map((b) => `- ${b.text}`).join('\n')}`,
).join('\n\n')}

Output JSON: { "roleKey": ["bullet1", "bullet2", ...] }
where roleKey is "Title_Company" (no special chars).`;

  try {
    const result = await callLLM([{ role: 'user', content: prompt }], {
      maxTokens: 2000,
      temperature: 0.2,
      systemPrompt: 'You are an expert ATS resume writer who never fabricates experience.',
    });
    const match = result.content.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
  } catch { /* fallback to existing bullets */ }

  return {};
}

// ─── Deterministic filename ───────────────────────────────────────────────────

export function generateVariantFilename(
  candidateName: string,
  targetRole: string,
  company?: string,
  version = 1,
): string {
  const clean = (s: string) => s.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  const namePart    = clean(candidateName);
  const rolePart    = clean(targetRole);
  const companyPart = company ? `_${clean(company)}` : '';
  return `${namePart}_${rolePart}${companyPart}_Resume_v${version}.md`;
}

// ─── Main generator ───────────────────────────────────────────────────────────

export async function generateResumeVariant(
  input: VariantGenerationInput,
): Promise<VariantGenerationResult> {
  const {
    profile,
    targetRole,
    targetCompany,
    targetIndustry,
    jobDescription = '',
    jobTitle,
  } = input;

  // 1. Extract JD keywords (exact phrasing preserved)
  const jdKeywords = extractJobKeywords(
    jobTitle ?? targetRole,
    jobDescription,
  );

  // 2. Job language profile
  const langProfile = profileJobLanguage(
    jobTitle ?? targetRole,
    targetCompany ?? '',
    jobDescription,
  );

  // 3. Optionally AI-enhance bullets
  let aiBullets: Record<string, string[]> = {};
  if (input.useAIBullets && jobDescription) {
    aiBullets = await generateAIBullets(profile, targetRole, jdKeywords);
  }

  // 4. Build top-third (summary + skills + top achievements)
  const topThird = optimizeTopThird(profile, targetRole, jdKeywords, targetCompany);

  // 5. Build experience section
  const experienceSection = buildExperienceSection(profile, jdKeywords, langProfile);

  // 6. Build remaining sections
  const educationSection      = buildEducationSection(profile);
  const certificationsSection = buildCertificationsSection(profile);
  const projectsSection       = buildProjectsSection(profile);

  // 7. Assemble full document
  const contactSection =
    `# ${profile.fullName}\n\n` +
    `${profile.email}` +
    (profile.phone    ? ` | ${profile.phone}`    : '') +
    (profile.location ? ` | ${profile.location}` : '') +
    (profile.linkedInUrl ? ` | ${profile.linkedInUrl}` : '');

  const rawContent = [
    contactSection,
    topThird.content,
    experienceSection,
    educationSection,
    certificationsSection,
    projectsSection,
  ]
    .filter(Boolean)
    .join('\n\n');

  // 8. Enforce ATS formatting rules
  const { cleaned: content, violations } = enforceATSFormat(rawContent);

  // 9. Validate bullets
  const allBullets = (content.match(/^- .+$/gm) ?? []);
  const bulletValidation = validateBullets(allBullets);

  // 10. Parser validation
  const parserResult = runParserValidation(content);

  // 11. Keyword gap analysis
  const gapReport = analyzeKeywordGap(jdKeywords, content);

  // 12. Compute scores
  const atsScoreResult    = computeATSScore(gapReport, parserResult);
  const recruiterScore    = computeRecruiterScore(content, jdKeywords.required);

  return {
    content,
    targetRole,
    targetCompany,
    atsScore:           atsScoreResult.overall,
    keywordCoverage:    gapReport.coverageScore,
    recruiterScore,
    topThirdScore:      topThird.score,
    bulletQualityScore: bulletValidation.overallScore,
    profileVersionHash: profile.profileVersionHash,
    jdKeywords,
    gapReport,
    parserWarnings:     parserResult.warnings,
    parserErrors:       parserResult.errors,
    recommendations:    [
      ...atsScoreResult.recommendations,
      ...violations.map((v) => v.message),
    ],
  };
}
