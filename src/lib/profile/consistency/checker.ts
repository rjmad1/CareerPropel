/**
 * Cross-Document Consistency Checker
 *
 * Detects contradictions between resume variants, LinkedIn narrative,
 * cover letters, and the canonical master profile.
 */

import type { MasterProfile, MasterRole } from '../master-profile/types';
import type { ConsistencyAuditReport, ConsistencyIssue } from './types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseYearMonth(dateStr: string): Date {
  const [year, month] = dateStr.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1);
}

function monthsBetween(a: Date, b: Date): number {
  return Math.abs(
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()),
  );
}

// ─── Chronology checks ────────────────────────────────────────────────────────

function checkChronology(roles: MasterRole[]): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const sorted = roles
    .filter((r) => r.startDate)
    .slice()
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next    = sorted[i + 1];
    if (!current.endDate) continue; // still current

    const end   = parseYearMonth(current.endDate);
    const start = parseYearMonth(next.startDate);

    const gap     = monthsBetween(end, start);
    const overlap = start < end;

    if (overlap) {
      issues.push({
        type:    'chronology_overlap',
        level:   'warning',
        message: `Roles "${current.title} at ${current.company}" and "${next.title} at ${next.company}" overlap in time.`,
        source:  'resume',
        fix:     'Adjust dates to reflect actual tenures or clarify concurrent roles.',
      });
    } else if (gap > 6) {
      issues.push({
        type:    'chronology_gap',
        level:   'info',
        message: `${gap}-month gap between "${current.company}" and "${next.company}".`,
        source:  'resume',
        fix:     'Consider adding a project, consulting work, or career break note to cover the gap.',
      });
    }
  }

  return issues;
}

// ─── Title consistency ────────────────────────────────────────────────────────

function checkTitleConsistency(
  profileRoles: MasterRole[],
  resumeText: string,
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  for (const role of profileRoles) {
    // Title should appear verbatim (or close) in the resume
    if (role.title && !resumeText.toLowerCase().includes(role.title.toLowerCase())) {
      issues.push({
        type:    'title_mismatch',
        level:   'warning',
        message: `Canonical title "${role.title}" not found verbatim in resume.`,
        source:  'resume',
        fix:     `Ensure the resume uses exactly "${role.title}" to match LinkedIn and profile records.`,
      });
    }
  }
  return issues;
}

// ─── Skill consistency ────────────────────────────────────────────────────────

function checkSkillConsistency(
  profileTopSkills: string[],
  resumeText: string,
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const missing: string[] = [];

  for (const skill of profileTopSkills) {
    if (!resumeText.toLowerCase().includes(skill.toLowerCase())) {
      missing.push(skill);
    }
  }

  if (missing.length > 3) {
    issues.push({
      type:    'skill_missing_in_resume',
      level:   'warning',
      message: `${missing.length} top profile skills not found in resume: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '...' : ''}.`,
      source:  'resume',
      fix:     'Add a Core Competencies section or weave these skills into bullet points.',
    });
  }

  return issues;
}

// ─── Keyword/terminology drift ────────────────────────────────────────────────

function checkTerminologyDrift(
  resumeText: string,
  coverLetterText?: string,
): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  if (!coverLetterText) return issues;

  // High-value terms that must not be synonymized between docs
  const HIGH_VALUE_TERMS = [
    'Product Lifecycle Management',
    'Machine Learning',
    'DevOps',
    'Site Reliability Engineering',
    'Platform Engineering',
    'Data Engineering',
    'Customer Success',
  ];

  for (const term of HIGH_VALUE_TERMS) {
    const inResume = resumeText.toLowerCase().includes(term.toLowerCase());
    const inCover  = coverLetterText.toLowerCase().includes(term.toLowerCase());
    if (inResume && !inCover) {
      issues.push({
        type:    'keyword_terminology_drift',
        level:   'info',
        message: `Term "${term}" present in resume but absent in cover letter.`,
        source:  'cross_document',
        fix:     `Reference "${term}" in the cover letter to maintain terminology consistency.`,
      });
    }
  }

  return issues;
}

// ─── Main audit ───────────────────────────────────────────────────────────────

export function runConsistencyAudit(
  profile: MasterProfile,
  resumeText: string,
  coverLetterText?: string,
): ConsistencyAuditReport {
  const issues: ConsistencyIssue[] = [
    ...checkChronology(profile.roles),
    ...checkTitleConsistency(profile.roles, resumeText),
    ...checkSkillConsistency(profile.topSkills, resumeText),
    ...checkTerminologyDrift(resumeText, coverLetterText),
  ];

  const errorCount   = issues.filter((i) => i.level === 'error').length;
  const warningCount = issues.filter((i) => i.level === 'warning').length;

  // Score: 100 - (errors × 15) - (warnings × 5)
  const overallScore = Math.max(0, 100 - errorCount * 15 - warningCount * 5);
  const passed = errorCount === 0;

  return {
    candidateId:  profile.candidateId,
    auditedAt:    new Date().toISOString(),
    overallScore,
    issues,
    errorCount,
    warningCount,
    passed,
  };
}
