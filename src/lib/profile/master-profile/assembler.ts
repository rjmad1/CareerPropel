/**
 * Master Profile Assembler
 *
 * Aggregates all candidate career intelligence from the database and
 * assembles it into a canonical MasterProfile. This is the ONLY trusted
 * source for all downstream document generation.
 *
 * Reading order:
 *   Candidate → ProfileData → Skill → Achievement → ProfileEntity →
 *   Accomplishment → StarStory → ProfileScore
 */

import { prisma } from '@/lib/db';
import {
  deduplicateSkills,
  classifyBulletStrength,
  parseBullet,
  normalizeSkillName,
  normalizeAccomplishments,
  selectTopSkills,
  estimateCareerLevel,
  computeProfileHash,
  runNormalizationReport,
} from './normalizer';
import type {
  MasterProfile,
  MasterRole,
  MasterSkill,
  MasterBullet,
  MasterEducation,
  MasterCertification,
  MasterProject,
  MasterStarStory,
  NormalizationReport,
} from './types';

// ─── ProfileEntity data shapes ────────────────────────────────────────────────

interface ExperienceEntity {
  title?: string;
  company?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets?: string[];
  skills?: string[];
  industry?: string;
}

interface EducationEntity {
  degree?: string;
  field?: string;
  institution?: string;
  graduationYear?: number;
  gpa?: number;
  honors?: string;
}

interface CertEntity {
  name?: string;
  issuer?: string;
  issuedDate?: string;
  expiryDate?: string;
  credentialId?: string;
}

interface ProjectEntity {
  name?: string;
  description?: string;
  skills?: string[];
  outcomes?: string[];
  url?: string;
  period?: string;
}

// ─── Assembler ────────────────────────────────────────────────────────────────

export async function assembleMasterProfile(
  candidateId: string,
): Promise<{ profile: MasterProfile; report: NormalizationReport }> {
  // Single wide fetch — all relations in one query
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      skills:          true,
      achievements:    true,
      profileEntities: true,
      accomplishments: true,
      starStories:     true,
      profileScore:    true,
      accomplishmentBankItems: true,
    },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  // ── Skills ──────────────────────────────────────────────────────────────────
  const rawSkills: MasterSkill[] = candidate.skills.map((s) => ({
    name:             normalizeSkillName(s.name),
    aliases:          [s.name.toLowerCase()],
    proficiency:      s.proficiency as MasterSkill['proficiency'],
    yearsOfExperience: undefined,
    lastUsed:          s.updatedAt.toISOString().slice(0, 7),
    category:          'general',
  }));
  const { skills, merged: skillsMerged } = deduplicateSkills(rawSkills);

  // ── Profile entities (experience, education, certs, projects) ──────────────
  const roles: MasterRole[] = [];
  const educationList: MasterEducation[] = [];
  const certifications: MasterCertification[] = [];
  const projects: MasterProject[] = [];

  for (const entity of candidate.profileEntities) {
    const data = entity.data as Record<string, unknown>;

    if (entity.type === 'experience') {
      const exp = data as ExperienceEntity;
      const rawBullets = exp.bullets ?? [];
      const weakBullets: string[] = [];
      const bullets: MasterBullet[] = rawBullets.map((text, i) => {
        const strength = classifyBulletStrength(text);
        if (strength === 'weak') weakBullets.push(text);
        return parseBullet(`${entity.id}-b${i}`, text, exp.skills ?? []);
      });

      roles.push({
        title:     exp.title    ?? 'Unknown Role',
        company:   exp.company  ?? 'Unknown Company',
        location:  exp.location,
        startDate: exp.startDate ?? '',
        endDate:   exp.endDate,
        isCurrent: !exp.endDate,
        bullets:   bullets.filter((b) => b.strength !== 'weak'),
        skills:    (exp.skills ?? []).map(normalizeSkillName),
        industry:  exp.industry,
      });
    }

    if (entity.type === 'education') {
      const edu = data as EducationEntity;
      educationList.push({
        degree:         edu.degree    ?? '',
        field:          edu.field     ?? '',
        institution:    edu.institution ?? '',
        graduationYear: edu.graduationYear,
        gpa:            edu.gpa,
        honors:         edu.honors,
      });
    }

    if (entity.type === 'certification') {
      const cert = data as CertEntity;
      certifications.push({
        name:         cert.name        ?? '',
        issuer:       cert.issuer      ?? '',
        issuedDate:   cert.issuedDate,
        expiryDate:   cert.expiryDate,
        credentialId: cert.credentialId,
      });
    }

    if (entity.type === 'project') {
      const proj = data as ProjectEntity;
      projects.push({
        name:        proj.name        ?? '',
        description: proj.description ?? '',
        skills:      (proj.skills ?? []).map(normalizeSkillName),
        outcomes:    proj.outcomes,
        url:         proj.url,
        period:      proj.period,
      });
    }
  }

  // Sort roles: current first, then most-recent start
  roles.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
    return b.startDate.localeCompare(a.startDate);
  });

  // ── Accomplishments ─────────────────────────────────────────────────────────
  const accomplishments = normalizeAccomplishments(
    candidate.accomplishments.map((a) => ({
      id:          a.id,
      title:       a.title,
      description: a.description,
      metrics:     a.metrics,
      starContext: a.starContext,
      category:    a.category,
    })),
  );

  // Supplement with explicit bank items if present
  for (const item of candidate.accomplishmentBankItems) {
    accomplishments.push({
      id:              item.id,
      action:          item.action,
      scope:           item.scope,
      result:          item.result,
      metric:          item.metric ?? undefined,
      evidence:        item.evidence ?? undefined,
      category:        item.category,
      function:        item.function ?? undefined,
      industry:        item.industry ?? undefined,
      domain:          item.domain ?? undefined,
      competency:      item.competency ?? undefined,
      operationalScale: item.operationalScale ?? undefined,
      associatedSkills: item.associatedSkills,
      associatedRoles:  item.associatedRoles,
      associatedTools:  item.associatedTools,
      isVerified:      item.isVerified,
    });
  }

  // ── STAR stories ────────────────────────────────────────────────────────────
  const starStories: MasterStarStory[] = candidate.starStories.map((s) => ({
    id:                     s.id,
    competency:             s.competency,
    additionalCompetencies: s.competencies,
    title:                  s.title,
    situation:              s.situation,
    task:                   s.task,
    action:                 s.action,
    result:                 s.result,
    metrics:                s.metrics,
    skills:                 [],
    interviewQuestions:     s.interviewQuestions,
    relevanceScore:         s.relevanceScore,
  }));

  // ── Career metadata ──────────────────────────────────────────────────────────
  const now = new Date();
  let totalYearsExperience = 0;
  for (const role of roles) {
    if (!role.startDate) continue;
    const start = new Date(role.startDate + '-01');
    const end   = role.endDate ? new Date(role.endDate + '-01') : now;
    totalYearsExperience += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  }
  totalYearsExperience = Math.round(totalYearsExperience * 10) / 10;

  const primaryIndustries = [
    ...new Set(roles.map((r) => r.industry).filter(Boolean) as string[]),
  ].slice(0, 3);

  const careerLevel = estimateCareerLevel(
    totalYearsExperience,
    roles.map((r) => r.title),
  );

  const topSkills = selectTopSkills(skills);

  // ── Summary ──────────────────────────────────────────────────────────────────
  const professionalSummary =
    candidate.summary ??
    `${careerLevel === 'senior' || careerLevel === 'staff' ? 'Senior' : ''} professional with ${Math.floor(totalYearsExperience)}+ years of experience.`.trim();

  // ── Normalization report ─────────────────────────────────────────────────────
  const weakBullets = roles.flatMap((r) =>
    r.bullets.filter((b) => b.strength === 'weak').map((b) => b.text),
  );
  const report = runNormalizationReport(
    rawSkills.length,
    skillsMerged,
    weakBullets,
  );

  // ── Hash ─────────────────────────────────────────────────────────────────────
  const profileVersionHash = computeProfileHash(candidateId, {
    skills: skills.map((s) => s.name).sort(),
    roles:  roles.map((r) => `${r.company}:${r.title}:${r.startDate}`).sort(),
    accomplishments: accomplishments.map((a) => a.id).sort(),
  });

  const profile: MasterProfile = {
    candidateId,
    profileVersionHash,
    assembledAt:          new Date().toISOString(),
    fullName:             candidate.name,
    email:                candidate.email,
    phone:                candidate.phone ?? undefined,
    location:             candidate.location ?? undefined,
    linkedInUrl:          undefined,
    portfolioUrl:         undefined,
    professionalSummary,
    roles,
    skills,
    accomplishments,
    education:            educationList,
    certifications,
    projects,
    starStories,
    totalYearsExperience,
    primaryIndustries,
    topSkills,
    careerLevel,
  };

  return { profile, report };
}
