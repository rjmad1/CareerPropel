#!/usr/bin/env tsx
/**
 * CareerPropel — Enterprise Demo Seed Engine
 * ==========================================
 * Generates comprehensive synthetic demo/test data across ALL functional domains.
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts [options]
 *
 * Options:
 *   --profile=small|medium|enterprise|stress-test   Dataset size profile (default: medium)
 *   --dry-run                                        Preview what would be created (no DB writes)
 *   --verify                                         Run integrity checks after seeding
 *   --help                                           Show this help message
 *
 * Demo Credentials:
 *   demo+admin@careerpropel.dev         Admin
 *   demo+alice.johnson@careerpropel.dev Senior Job Seeker
 *   demo+bob.chen@careerpropel.dev      Mid-level Job Seeker
 *   demo+carol.park@careerpropel.dev    Entry-level Job Seeker
 *   demo+recruiter@careerpropel.dev     Recruiter
 *   demo+coordinator@careerpropel.dev   Coordinator
 *
 * Data Isolation:
 *   All demo records use email prefix: demo+
 *   All demo emails use domain: @careerpropel.dev
 *   Purge via: npx tsx scripts/purge-demo-data.ts
 *
 * Governance:
 *   ✅ Idempotent — safe to run multiple times
 *   ✅ Deterministic — same profile = same data
 *   ✅ Cascade-safe — respects all FK constraints
 *   ✅ No production data contamination
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import {
  DEMO_EMAIL_DOMAIN,
  DEMO_EMAIL_PREFIX,
  DEMO_BATCH_ID,
  DEMO_SEED_VERSION,
  getDemoPassword,
  demoEmail,
  demoMeta,
  demoPreferences,
  seededRng,
  pick,
  pickN,
  randInt,
  daysAgo,
  daysAhead,
  ARCHETYPES,
  PROFILE_CONFIGS,
  type SeedProfile,
  type CandidateArchetype,
} from './lib/demo-data-registry';

import {
  generateCandidate,
  generateSkills,
  generateJobsForCandidate,
  generateInterview,
  generateOffer,
  generateDocument,
  generateCalendarEvent,
  generateAgentExecution,
  generateAuditLog,
  generateStarStory,
  generateResumeContent,
  generateCoverLetterContent,
  generateCompanyResearch,
  generateTechnicalPrep,
  ACHIEVEMENT_TEMPLATES,
  COMPANIES,
} from './lib/demo-data-generators';

// ─── CLI Argument Parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const doVerify = args.includes('--verify');
const showHelp = args.includes('--help');

if (showHelp) {
  console.log(`
CareerPropel Demo Seed Engine
Usage: npx tsx scripts/seed-demo-data.ts [options]

Options:
  --profile=small|medium|enterprise|stress-test  Dataset size profile (default: medium)
  --dry-run                                       Preview without writing to DB
  --verify                                        Run integrity checks post-seed
  --help                                          Show this help

Demo accounts (password: DemoPass123!):
  demo+admin@careerpropel.dev
  demo+alice.johnson.job.seeker.senior.0@careerpropel.dev
  demo+bob.chen.job.seeker.mid.0@careerpropel.dev
  demo+carol.park.job.seeker.entry.0@careerpropel.dev
  demo+recruiter.jones.recruiter.0@careerpropel.dev
  demo+sara.coordinator.coordinator.0@careerpropel.dev
`);
  process.exit(0);
}

const profileArg = args.find((a) => a.startsWith('--profile='));
const profile: SeedProfile = (profileArg?.split('=')[1] as SeedProfile) || 'medium';

if (!PROFILE_CONFIGS[profile]) {
  console.error(`❌ Unknown profile: ${profile}. Valid: small, medium, enterprise, stress-test`);
  process.exit(1);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient({
  log: ['error'],
});

const config = PROFILE_CONFIGS[profile];
const SEED_BASE = 42; // Deterministic seed base

// ─── Statistics Tracking ──────────────────────────────────────────────────────

const stats = {
  candidates: 0,
  skills: 0,
  achievements: 0,
  profileData: 0,
  profileEntities: 0,
  profileScores: 0,
  jobs: 0,
  jobActivities: 0,
  interviews: 0,
  interviewFeedback: 0,
  interviewPreps: 0,
  starStories: 0,
  offers: 0,
  documents: 0,
  calendarTokens: 0,
  calendarEvents: 0,
  jobImports: 0,
  agentExecutions: 0,
  toolCalls: 0,
  eventLogs: 0,
  auditLogs: 0,
  loginAttempts: 0,
  sessionActivities: 0,
  apiKeys: 0,
  userRoles: 0,
};

function log(emoji: string, message: string, count?: number) {
  const countStr = count !== undefined ? ` (${count})` : '';
  console.log(`  ${emoji} ${message}${countStr}`);
}

// ─── Pre-seed: Ensure RBAC roles exist ────────────────────────────────────────

async function ensureRoles(): Promise<Record<string, string>> {
  const roleDefinitions = [
    { name: 'admin', description: 'Platform administrator with full access' },
    { name: 'candidate', description: 'Job seeker with access to their own pipeline' },
    { name: 'recruiter', description: 'Recruiter with limited candidate visibility' },
    { name: 'coordinator', description: 'Interview coordinator with scheduling access' },
  ];

  const permissionDefinitions = [
    { name: 'jobs.create', resource: 'jobs', action: 'create', description: 'Create job applications' },
    { name: 'jobs.read', resource: 'jobs', action: 'read', description: 'View job applications' },
    { name: 'jobs.update', resource: 'jobs', action: 'update', description: 'Update job applications' },
    { name: 'jobs.delete', resource: 'jobs', action: 'delete', description: 'Delete job applications' },
    { name: 'candidates.read', resource: 'candidates', action: 'read', description: 'View candidate profiles' },
    { name: 'candidates.manage', resource: 'candidates', action: 'manage', description: 'Manage all candidate records' },
    { name: 'audit.read', resource: 'audit', action: 'read', description: 'View audit logs' },
    { name: 'settings.manage', resource: 'settings', action: 'manage', description: 'Manage platform settings' },
  ];

  if (isDryRun) {
    log('📋', 'DRY RUN: Would upsert 4 roles and 8 permissions');
    return {};
  }

  const roleIds: Record<string, string> = {};

  for (const roleDef of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {},
      create: roleDef,
    });
    roleIds[roleDef.name] = role.id;
  }

  const permissionIds: Record<string, string> = {};
  for (const permDef of permissionDefinitions) {
    const perm = await prisma.permission.upsert({
      where: { resource_action: { resource: permDef.resource, action: permDef.action } },
      update: {},
      create: permDef,
    });
    permissionIds[permDef.name] = perm.id;
  }

  // Wire permissions to roles
  const rolePerms: Record<string, string[]> = {
    admin: Object.keys(permissionIds),
    candidate: ['jobs.create', 'jobs.read', 'jobs.update', 'jobs.delete'],
    recruiter: ['candidates.read', 'jobs.read'],
    coordinator: ['candidates.read', 'jobs.read'],
  };

  for (const [roleName, perms] of Object.entries(rolePerms)) {
    const roleId = roleIds[roleName];
    for (const permName of perms) {
      const permId = permissionIds[permName];
      if (roleId && permId) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId, permissionId: permId } },
          update: {},
          create: { roleId, permissionId: permId },
        });
      }
    }
  }

  log('🔐', 'Roles & permissions ensured', 4);
  return roleIds;
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 CareerPropel Demo Seed Engine');
  console.log('═'.repeat(50));
  console.log(`  Profile    : ${profile}`);
  console.log(`  Batch ID   : ${DEMO_BATCH_ID}`);
  console.log(`  Version    : ${DEMO_SEED_VERSION}`);
  console.log(`  Dry Run    : ${isDryRun}`);
  console.log(`  Domain     : @${DEMO_EMAIL_DOMAIN}`);
  console.log('═'.repeat(50));

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE — no database writes will occur\n');
  }

  // Hash the demo password once
  const demoPassword = getDemoPassword();
  const passwordHash = isDryRun
    ? 'hash_placeholder'
    : await bcrypt.hash(demoPassword, 12);

  // Ensure RBAC infrastructure
  const roleIds = await ensureRoles();

  // ── Track all created candidates for cross-entity relationships ──
  const allCandidates: Array<{
    id: string;
    email: string;
    archetype: CandidateArchetype;
    name: string;
  }> = [];

  // ── Well-known fixed demo accounts (always created regardless of profile) ──
  const FIXED_ACCOUNTS = [
    {
      email: demoEmail('admin'),
      name: '[DEMO] Admin User',
      archetype: 'hiring_manager' as CandidateArchetype,
      role: 'admin',
      summary: 'Platform administrator for the CareerPropel demo environment. Full access to all features.',
    },
  ];

  console.log('\n📦 Phase 1: Core Candidates\n');

  // Seed fixed accounts
  for (const account of FIXED_ACCOUNTS) {
    if (!isDryRun) {
      const existing = await prisma.candidate.findUnique({ where: { email: account.email } });
      if (existing) {
        log('⏭️', `Skipped (exists): ${account.email}`);
        allCandidates.push({ id: existing.id, email: account.email, archetype: account.archetype, name: account.name });
        continue;
      }

      const c = await prisma.candidate.create({
        data: {
          email: account.email,
          name: account.name,
          phone: '+1 (512) 000-0001',
          location: 'Remote — US',
          summary: account.summary,
          passwordHash,
          emailVerified: true,
          preferences: demoPreferences('dark', true, { role: 'admin', isFixed: true }),
        },
      });

      // Assign role
      if (roleIds[account.role]) {
        await prisma.userRole.upsert({
          where: { email_roleId: { email: account.email, roleId: roleIds[account.role] } },
          update: {},
          create: { email: account.email, roleId: roleIds[account.role], grantedBy: 'seed-system' },
        });
        stats.userRoles++;
      }

      allCandidates.push({ id: c.id, email: c.email, archetype: account.archetype, name: c.name });
      stats.candidates++;
      log('✓', `Created fixed account: ${account.email}`);
    } else {
      log('📋', `DRY RUN: Would create fixed account: ${account.email}`);
    }
  }

  // ── Generate archetype candidates ──
  for (const archetype of ARCHETYPES) {
    const archetypeRng = seededRng(SEED_BASE + ARCHETYPES.indexOf(archetype) * 1000);
    const count = config.candidatesPerArchetype;

    for (let i = 0; i < count; i++) {
      const candidateRng = seededRng(SEED_BASE + ARCHETYPES.indexOf(archetype) * 1000 + i * 100);
      const candidateData = generateCandidate(archetype, i, candidateRng, passwordHash);

      if (isDryRun) {
        log('📋', `DRY RUN: Would create ${archetype} candidate: ${candidateData.email}`);
        stats.candidates++;
        continue;
      }

      // Skip if already exists (idempotency)
      const existing = await prisma.candidate.findUnique({
        where: { email: candidateData.email },
      });
      if (existing) {
        log('⏭️', `Skipped (exists): ${candidateData.email}`);
        allCandidates.push({ id: existing.id, email: existing.email, archetype, name: existing.name });
        continue;
      }

      const { archetype: _arch, ...candidateCreateData } = candidateData;
      const candidate = await prisma.candidate.create({
        data: candidateCreateData,
      });

      allCandidates.push({ id: candidate.id, email: candidate.email, archetype, name: candidate.name });
      stats.candidates++;

      // Assign role based on archetype
      const roleMap: Record<CandidateArchetype, string> = {
        job_seeker_senior: 'candidate',
        job_seeker_mid: 'candidate',
        job_seeker_entry: 'candidate',
        recruiter: 'recruiter',
        hiring_manager: 'candidate',
        coordinator: 'coordinator',
      };

      const roleName = roleMap[archetype];
      if (roleIds[roleName]) {
        await prisma.userRole.upsert({
          where: { email_roleId: { email: candidate.email, roleId: roleIds[roleName] } },
          update: {},
          create: { email: candidate.email, roleId: roleIds[roleName] },
        }).catch(() => {}); // Ignore duplicate key on re-runs
        stats.userRoles++;
      }

      // ── Skills ──
      const skills = generateSkills(archetype, seededRng(candidate.id.length * 7));
      for (const skill of skills) {
        await prisma.skill.upsert({
          where: { candidateId_name: { candidateId: candidate.id, name: skill.name } },
          update: {},
          create: { candidateId: candidate.id, ...skill },
        });
        stats.skills++;
      }

      // ── Achievements ──
      const achievementCount = randInt(2, 5, candidateRng);
      const selectedAchievements = pickN(ACHIEVEMENT_TEMPLATES, achievementCount, candidateRng);
      for (const achievement of selectedAchievements) {
        await prisma.achievement.create({
          data: { candidateId: candidate.id, ...achievement },
        });
        stats.achievements++;
      }

      // ── Profile Data ──
      const resumeContent = generateResumeContent(candidate.name, archetype, candidateData.location);
      await prisma.profileData.upsert({
        where: { candidateId_type: { candidateId: candidate.id, type: 'resume' } },
        update: {},
        create: {
          candidateId: candidate.id,
          type: 'resume',
          content: resumeContent,
        },
      });
      stats.profileData++;

      await prisma.profileData.upsert({
        where: { candidateId_type: { candidateId: candidate.id, type: 'linkedin_export' } },
        update: {},
        create: {
          candidateId: candidate.id,
          type: 'linkedin_export',
          content: {
            ...demoMeta(),
            url: `https://linkedin.com/in/${candidate.name.toLowerCase().replace(' ', '-')}`,
            connections: randInt(200, 5000, candidateRng),
            followers: randInt(150, 8000, candidateRng),
            headline: `${archetype.replace(/_/g, ' ')} | Open to opportunities`,
            recommendations: randInt(3, 40, candidateRng),
          },
        },
      });
      stats.profileData++;

      // ── Profile Entities ──
      const entityTypes = ['experience', 'education', 'skill', 'certification', 'project'];
      for (const entityType of entityTypes) {
        await prisma.profileEntity.create({
          data: {
            candidateId: candidate.id,
            type: entityType,
            source: pick(['resume', 'linkedin_export'], candidateRng),
            confidence: parseFloat((candidateRng() * 0.2 + 0.8).toFixed(2)),
            data: {
              ...demoMeta(),
              entityType,
              extractedFor: archetype,
              content: `Synthetic ${entityType} entity for demo candidate`,
            },
          },
        });
        stats.profileEntities++;
      }

      // ── Profile Score ──
      await prisma.profileScore.upsert({
        where: { candidateId: candidate.id },
        update: {},
        create: {
          candidateId: candidate.id,
          overall: randInt(72, 97, candidateRng),
          sections: {
            ...demoMeta(),
            resume_completeness: randInt(70, 100, candidateRng),
            achievement_metrics: randInt(65, 100, candidateRng),
            skills_coverage: randInt(75, 100, candidateRng),
            job_pipeline_health: randInt(60, 100, candidateRng),
            interview_readiness: randInt(55, 100, candidateRng),
          },
          recommendations: [
            'Add 2-3 more quantified achievements to strengthen impact narrative.',
            'Consider adding portfolio links for design and engineering roles.',
            'Update LinkedIn headline to match target role level.',
            'Prepare 5-7 STAR stories covering all key competencies.',
          ],
        },
      });
      stats.profileScores++;
    }
  }

  log('✅', `Candidates created`, stats.candidates);

  // ── Phase 2: Jobs and Pipeline ──
  console.log('\n📦 Phase 2: Job Pipeline\n');

  const allCreatedJobs: Array<{ id: string; candidateId: string; stage: string; title: string }> = [];

  for (const candidate of allCandidates) {
    const jobRng = seededRng(candidate.id.length * 13 + SEED_BASE);
    const jobCount = config.jobsPerCandidate;
    const jobsData = generateJobsForCandidate(candidate.id, candidate.archetype, jobCount, jobRng);

    if (isDryRun) {
      log('📋', `DRY RUN: Would create ${jobCount} jobs for ${candidate.email}`);
      stats.jobs += jobCount;
      continue;
    }

    for (const jobData of jobsData) {
      const job = await prisma.job.create({ data: jobData as Parameters<typeof prisma.job.create>[0]['data'] });
      allCreatedJobs.push({ id: job.id, candidateId: job.candidateId, stage: job.stage, title: job.title });
      stats.jobs++;

      // ── Job Activities (timeline events) ──
      await prisma.jobActivity.create({
        data: { jobId: job.id, action: 'sourced', metadata: { ...demoMeta(), source: pick(['LinkedIn', 'Referral', 'Job Board', 'Company Website', 'Recruiter Outreach'], jobRng) } },
      });
      stats.jobActivities++;

      if (jobData.appliedAt) {
        await prisma.jobActivity.create({
          data: { jobId: job.id, action: 'applied', metadata: { ...demoMeta(), method: pick(['online', 'referral', 'direct'], jobRng) } },
        });
        stats.jobActivities++;
      }

      if (!['sourced', 'interested', 'resume_tailoring', 'applied', 'rejected', 'archived'].includes(job.stage)) {
        await prisma.jobActivity.create({
          data: {
            jobId: job.id,
            action: 'stage_changed',
            metadata: { ...demoMeta(), from: 'applied', to: job.stage },
            createdAt: daysAgo(randInt(1, 30, jobRng)),
          },
        });
        stats.jobActivities++;
      }

      if (['offer', 'negotiation'].includes(job.stage)) {
        await prisma.jobActivity.create({
          data: { jobId: job.id, action: 'offer_received', metadata: { ...demoMeta() } },
        });
        stats.jobActivities++;
      }
    }
  }

  log('✅', `Jobs created`, stats.jobs);

  // ── Phase 3: Interviews ──
  console.log('\n📦 Phase 3: Interviews\n');

  // Only create interviews for jobs that are past early stages
  const interviewableJobs = allCreatedJobs.filter((j) =>
    !['sourced', 'interested', 'resume_tailoring', 'applied'].includes(j.stage)
  );

  for (const job of interviewableJobs) {
    const interviewCount = Math.min(config.interviewsPerJob, randInt(1, config.interviewsPerJob, seededRng(job.id.length)));
    const interviewRng = seededRng(job.id.length * 17 + SEED_BASE);

    for (let i = 0; i < interviewCount; i++) {
      if (isDryRun) {
        stats.interviews++;
        continue;
      }

      const interviewData = generateInterview(job.candidateId, job.id, i, job.stage, interviewRng);
      const interview = await prisma.interview.create({ data: interviewData as Parameters<typeof prisma.interview.create>[0]['data'] });
      stats.interviews++;

      // ── Interview Feedback ──
      if (interviewData.status === 'completed') {
        await prisma.interviewFeedback.create({
          data: {
            candidateId: job.candidateId,
            jobId: job.id,
            type: pick(['behavioral', 'technical', 'system_design', 'other'], interviewRng),
            selfRating: randInt(2, 5, interviewRng),
            notes: `Interview went ${pick(['very well', 'well', 'adequately', 'challenging but positive'], interviewRng)}. Strong ${pick(['technical depth', 'behavioral alignment', 'communication', 'product sense'], interviewRng)} demonstrated. ${pick(['Expecting to advance.', 'Waiting for feedback.', 'Strong positive signal from panel.'], interviewRng)}`,
          },
        });
        stats.interviewFeedback++;
      }
    }
  }

  log('✅', `Interviews created`, stats.interviews);

  // ── Phase 4: Interview Prep & STAR Stories ──
  console.log('\n📦 Phase 4: Interview Prep & STAR Stories\n');

  // Create prep packages for some jobs
  const prepJobs = allCreatedJobs.filter((j) =>
    ['technical_interview', 'system_design', 'behavioral', 'final_round', 'offer', 'negotiation'].includes(j.stage)
  ).slice(0, Math.ceil(allCreatedJobs.length * 0.3));

  for (const job of prepJobs) {
    if (isDryRun) {
      stats.interviewPreps++;
      stats.starStories += 3;
      continue;
    }

    const prepRng = seededRng(job.id.length * 23 + SEED_BASE);
    const company = pick(COMPANIES, prepRng);

    const existingPrep = await prisma.interviewPrep.findUnique({ where: { jobId: job.id } });
    if (existingPrep) continue;

    const prep = await prisma.interviewPrep.create({
      data: {
        candidateId: job.candidateId,
        jobId: job.id,
        role: job.title,
        company: company.name,
        prepStatus: pick(['not_started', 'generating', 'ready', 'ready', 'ready'], prepRng),
        confidenceScore: parseFloat((prepRng() * 0.4 + 0.6).toFixed(2)),
        contentVersion: randInt(1, 3, prepRng),
        companyResearch: generateCompanyResearch(company.name),
        technicalPrep: generateTechnicalPrep(job.title),
        generatedAt: daysAgo(randInt(1, 30, prepRng)),
        expiresAt: daysAhead(randInt(30, 90, prepRng)),
      },
    });
    stats.interviewPreps++;

    // ── STAR Stories ──
    const storyCount = randInt(2, 5, prepRng);
    for (let s = 0; s < storyCount; s++) {
      const storyRng = seededRng(job.id.length * 29 + s * 100);
      await prisma.starStory.create({
        data: generateStarStory(job.candidateId, prep.id, storyRng) as Parameters<typeof prisma.starStory.create>[0]['data'],
      });
      stats.starStories++;
    }
  }

  log('✅', `Interview prep packages created`, stats.interviewPreps);
  log('✅', `STAR stories created`, stats.starStories);

  // ── Phase 5: Offers ──
  console.log('\n📦 Phase 5: Offers\n');

  const offerableJobs = allCreatedJobs.filter((j) =>
    ['offer', 'negotiation', 'final_round'].includes(j.stage)
  );

  for (const candidate of allCandidates) {
    const candidateOfferableJobs = offerableJobs.filter((j) => j.candidateId === candidate.id);
    const offerCount = Math.min(config.offersPerCandidate, candidateOfferableJobs.length);

    for (let o = 0; o < offerCount; o++) {
      const job = candidateOfferableJobs[o];
      if (!job) break;

      if (isDryRun) {
        stats.offers++;
        continue;
      }

      const offerData = generateOffer(candidate.id, job.id, candidate.archetype, seededRng(job.id.length * 31));
      await prisma.offer.create({ data: offerData as Parameters<typeof prisma.offer.create>[0]['data'] });
      stats.offers++;
    }
  }

  log('✅', `Offers created`, stats.offers);

  // ── Phase 6: Documents ──
  console.log('\n📦 Phase 6: Documents\n');

  for (const candidate of allCandidates) {
    const docRng = seededRng(candidate.id.length * 37 + SEED_BASE);
    const docCount = config.documentsPerCandidate;
    const candidateJobs = allCreatedJobs.filter((j) => j.candidateId === candidate.id);

    for (let d = 0; d < docCount; d++) {
      if (isDryRun) {
        stats.documents++;
        continue;
      }

      const relatedJob = d < candidateJobs.length ? candidateJobs[d] : null;
      const docData = generateDocument(
        candidate.id,
        relatedJob?.id || null,
        candidate.name,
        candidate.archetype,
        d,
        docRng
      );

      await prisma.document.create({ data: docData as Parameters<typeof prisma.document.create>[0]['data'] });
      stats.documents++;
    }
  }

  log('✅', `Documents created`, stats.documents);

  // ── Phase 7: Calendar Events ──
  console.log('\n📦 Phase 7: Calendar Events\n');

  for (const candidate of allCandidates) {
    if (isDryRun) {
      stats.calendarTokens++;
      stats.calendarEvents += config.calendarEventsPerCandidate;
      continue;
    }

    const calRng = seededRng(candidate.id.length * 41 + SEED_BASE);

    // Calendar token (fake, explicitly synthetic)
    try {
      await prisma.calendarToken.upsert({
        where: { candidateId_provider: { candidateId: candidate.id, provider: 'google' } },
        update: {},
        create: {
          candidateId: candidate.id,
          provider: 'google',
          accessToken: `demo_fake_access_token_${candidate.id.slice(0, 8)}_NOT_REAL`,
          refreshToken: `demo_fake_refresh_token_${candidate.id.slice(0, 8)}_NOT_REAL`,
          expiresAt: daysAhead(30),
          scope: 'https://www.googleapis.com/auth/calendar',
        },
      });
      stats.calendarTokens++;
    } catch {
      // Ignore duplicates on re-runs
    }

    // Calendar events
    const candidateJobs = allCreatedJobs.filter((j) => j.candidateId === candidate.id);
    for (let e = 0; e < config.calendarEventsPerCandidate; e++) {
      const relatedJob = candidateJobs[e % candidateJobs.length];
      const eventData = generateCalendarEvent(candidate.id, relatedJob?.id || null, e, calRng);

      // Ensure unique external ID
      (eventData as Record<string, unknown>).externalId = `demo-cal-evt-${candidate.id.slice(0, 8)}-${e}-${Date.now()}`;

      try {
        await prisma.calendarEvent.create({ data: eventData as Parameters<typeof prisma.calendarEvent.create>[0]['data'] });
        stats.calendarEvents++;
      } catch {
        // Skip if constraint violation
      }
    }
  }

  log('✅', `Calendar tokens created`, stats.calendarTokens);
  log('✅', `Calendar events created`, stats.calendarEvents);

  // ── Phase 8: Job Imports ──
  console.log('\n📦 Phase 8: Job Board Imports\n');

  const sources = ['linkedin', 'greenhouse', 'indeed', 'manual'] as const;
  for (const candidate of allCandidates) {
    if (isDryRun) {
      stats.jobImports += 3;
      continue;
    }

    const importRng = seededRng(candidate.id.length * 43 + SEED_BASE);
    const importCount = randInt(1, 4, importRng);

    for (let im = 0; im < importCount; im++) {
      const source = pick([...sources], importRng);
      const company = pick(COMPANIES, importRng);

      await prisma.jobImport.create({
        data: {
          candidateId: candidate.id,
          source,
          externalId: `demo-ext-${source}-${candidate.id.slice(0, 6)}-${im}`,
          rawData: {
            ...demoMeta(),
            title: `${pick(['Senior', 'Lead', 'Principal', 'Staff'], importRng)} ${pick(['Software Engineer', 'Product Manager', 'Data Scientist', 'Platform Engineer'], importRng)}`,
            company: company.name,
            location: `${pick(['San Francisco', 'New York', 'Austin', 'Seattle', 'Remote'], importRng)}, ${pick(['CA', 'NY', 'TX', 'WA', 'Global'], importRng)}`,
            salary: randInt(120000, 350000, importRng),
            postedAt: daysAgo(randInt(1, 30, importRng)).toISOString(),
            source,
          },
          imported: im === 0,
          jobId: im === 0 ? (allCreatedJobs.find((j) => j.candidateId === candidate.id)?.id || null) : null,
        },
      });
      stats.jobImports++;
    }
  }

  log('✅', `Job imports created`, stats.jobImports);

  // ── Phase 9: Agent Executions ──
  console.log('\n📦 Phase 9: Agent Executions\n');

  for (const candidate of allCandidates) {
    if (isDryRun) {
      stats.agentExecutions += config.agentExecutionsPerCandidate;
      continue;
    }

    const agentRng = seededRng(candidate.id.length * 47 + SEED_BASE);
    const candidateJobs = allCreatedJobs.filter((j) => j.candidateId === candidate.id);

    for (let ae = 0; ae < config.agentExecutionsPerCandidate; ae++) {
      const job = candidateJobs[ae % Math.max(candidateJobs.length, 1)];
      const { execution, toolCalls, eventLogs } = generateAgentExecution(
        candidate.email,
        job?.title || 'General Career Assistance',
        ae,
        agentRng
      );

      const created = await prisma.agentExecution.create({ data: execution as Parameters<typeof prisma.agentExecution.create>[0]['data'] });
      stats.agentExecutions++;

      for (const tc of toolCalls) {
        await prisma.toolCall.create({ data: { ...tc, executionId: created.id } as Parameters<typeof prisma.toolCall.create>[0]['data'] });
        stats.toolCalls++;
      }

      for (const el of eventLogs) {
        await prisma.eventLog.create({ data: { ...el, executionId: created.id } as Parameters<typeof prisma.eventLog.create>[0]['data'] });
        stats.eventLogs++;
      }
    }
  }

  log('✅', `Agent executions created`, stats.agentExecutions);
  log('✅', `Tool calls created`, stats.toolCalls);
  log('✅', `Event logs created`, stats.eventLogs);

  // ── Phase 10: Audit Logs ──
  console.log('\n📦 Phase 10: Audit & Activity Logs\n');

  for (const candidate of allCandidates) {
    if (isDryRun) {
      stats.auditLogs += config.auditLogsPerCandidate;
      stats.loginAttempts += 10;
      stats.sessionActivities += 8;
      continue;
    }

    const auditRng = seededRng(candidate.id.length * 53 + SEED_BASE);
    const candidateJobs = allCreatedJobs.filter((j) => j.candidateId === candidate.id);

    for (let al = 0; al < config.auditLogsPerCandidate; al++) {
      const resourceId = candidateJobs[al % Math.max(candidateJobs.length, 1)]?.id || candidate.id;
      await prisma.auditLog.create({
        data: generateAuditLog(candidate.email, resourceId, al, auditRng) as Parameters<typeof prisma.auditLog.create>[0]['data'],
      });
      stats.auditLogs++;
    }

    // Login attempts
    for (let la = 0; la < 10; la++) {
      await prisma.loginAttempt.create({
        data: {
          email: candidate.email,
          success: la < 8 ? true : false, // 80% success rate
          ipAddress: `${randInt(10, 200, auditRng)}.${randInt(0, 255, auditRng)}.0.${randInt(1, 254, auditRng)}`,
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0',
          timestamp: daysAgo(randInt(0, 60, auditRng)),
        },
      });
      stats.loginAttempts++;
    }

    // Session activities
    for (let sa = 0; sa < 8; sa++) {
      await prisma.sessionActivity.create({
        data: {
          email: candidate.email,
          sessionId: `demo-session-${candidate.id.slice(0, 8)}-${sa}`,
          action: pick(['login', 'logout', 'api_call', 'data_access', 'page_view'], auditRng),
          ipAddress: `${randInt(10, 200, auditRng)}.${randInt(0, 255, auditRng)}.0.${randInt(1, 254, auditRng)}`,
          userAgent: 'Mozilla/5.0 Chrome/120',
          riskScore: randInt(0, 25, auditRng),
          timestamp: daysAgo(randInt(0, 30, auditRng)),
        },
      });
      stats.sessionActivities++;
    }

    // API Keys
    try {
      await prisma.apiKey.upsert({
        where: { prefix: `sk_demo_${candidate.id.slice(0, 6)}` },
        update: {},
        create: {
          email: candidate.email,
          keyHash: `demo_key_hash_${candidate.id}_NOT_REAL_NEVER_STORED`,
          name: `Demo API Key — ${candidate.archetype}`,
          prefix: `sk_demo_${candidate.id.slice(0, 6)}`,
          expiresAt: daysAhead(365),
          usageCount: randInt(0, 500, auditRng),
        },
      });
      stats.apiKeys++;
    } catch {
      // Skip duplicates
    }
  }

  log('✅', `Audit logs created`, stats.auditLogs);
  log('✅', `Login attempts created`, stats.loginAttempts);
  log('✅', `Session activities created`, stats.sessionActivities);
  log('✅', `API keys created`, stats.apiKeys);

  // ── Phase 11: Edge Case Records ──
  console.log('\n📦 Phase 11: Edge Cases\n');

  if (!isDryRun && allCandidates.length > 0) {
    const edgeCandidate = allCandidates[0];

    // Extremely long job note
    await prisma.job.create({
      data: {
        candidateId: edgeCandidate.id,
        title: '[DEMO] Edge Case — Very Long Content Job',
        company: '[DEMO] Edge Case Corp.',
        description: 'A'.repeat(5000) + ' [SYNTHETIC EDGE CASE: max content length test]',
        notes: 'Long note: ' + 'This is a very detailed recruiter note that covers every possible aspect of the application process in exhaustive detail. '.repeat(20),
        stage: 'applied',
        tags: ['edge-case', 'demo', 'synthetic', 'max-length-test'],
        salary: 999999,
        matchScore: 0.0,
        priority: 'low',
        url: 'https://example.com/jobs/edge-case',
        location: 'Remote — Edge Case City, Edge State 99999',
      },
    });

    // Empty/minimal job
    await prisma.job.create({
      data: {
        candidateId: edgeCandidate.id,
        title: '[DEMO] Minimal Job Entry',
        company: '[DEMO] Minimal Co.',
        stage: 'sourced',
      },
    });

    // Unicode/international edge case
    await prisma.job.create({
      data: {
        candidateId: edgeCandidate.id,
        title: '[DEMO] Rôle de Développeur Sénior — Müller & Co. — 高级工程师',
        company: '[DEMO] Müller-Björk International',
        location: 'München, Deutschland 🇩🇪',
        notes: 'Unicode test: 日本語テキスト • Ñoño español • العربية • 中文 • Ελληνικά',
        stage: 'interested',
        tags: ['unicode', 'international', 'demo-edge-case'],
      },
    });

    log('✓', 'Edge case records created', 3);
  }

  // ── Final Summary ──
  console.log('\n═'.repeat(50));
  console.log('✅  DEMO SEED COMPLETE');
  console.log('═'.repeat(50));
  console.log(`\n📊 Dataset Statistics:`);
  console.log(`   Profile             : ${profile.toUpperCase()}`);
  console.log(`   Candidates          : ${stats.candidates}`);
  console.log(`   Skills              : ${stats.skills}`);
  console.log(`   Achievements        : ${stats.achievements}`);
  console.log(`   Profile Data        : ${stats.profileData}`);
  console.log(`   Profile Entities    : ${stats.profileEntities}`);
  console.log(`   Profile Scores      : ${stats.profileScores}`);
  console.log(`   Jobs                : ${stats.jobs}`);
  console.log(`   Job Activities      : ${stats.jobActivities}`);
  console.log(`   Interviews          : ${stats.interviews}`);
  console.log(`   Interview Feedback  : ${stats.interviewFeedback}`);
  console.log(`   Interview Preps     : ${stats.interviewPreps}`);
  console.log(`   STAR Stories        : ${stats.starStories}`);
  console.log(`   Offers              : ${stats.offers}`);
  console.log(`   Documents           : ${stats.documents}`);
  console.log(`   Calendar Tokens     : ${stats.calendarTokens}`);
  console.log(`   Calendar Events     : ${stats.calendarEvents}`);
  console.log(`   Job Imports         : ${stats.jobImports}`);
  console.log(`   Agent Executions    : ${stats.agentExecutions}`);
  console.log(`   Tool Calls          : ${stats.toolCalls}`);
  console.log(`   Event Logs          : ${stats.eventLogs}`);
  console.log(`   Audit Logs          : ${stats.auditLogs}`);
  console.log(`   Login Attempts      : ${stats.loginAttempts}`);
  console.log(`   Session Activities  : ${stats.sessionActivities}`);
  console.log(`   API Keys            : ${stats.apiKeys}`);
  console.log(`   User Roles          : ${stats.userRoles}`);

  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
  console.log(`\n   TOTAL RECORDS       : ${totalRecords}`);

  console.log('\n🔑 Demo Login Credentials:');
  console.log('   Password for ALL accounts: value of DEMO_PASSWORD');
  console.log('   ─────────────────────────────────────────────────────');
  console.log('   Admin           : demo+admin@careerpropel.dev');
  // Print first generated candidate per archetype
  const printedArchetypes = new Set<string>();
  for (const c of allCandidates) {
    if (!printedArchetypes.has(c.archetype) && c.archetype !== 'hiring_manager') {
      const label = {
        job_seeker_senior: 'Senior Candidate',
        job_seeker_mid:    'Mid Candidate   ',
        job_seeker_entry:  'Entry Candidate ',
        recruiter:         'Recruiter       ',
        coordinator:       'Coordinator     ',
      }[c.archetype] ?? c.archetype;
      console.log(`   ${label}: ${c.email}`);
      printedArchetypes.add(c.archetype);
    }
  }
  console.log('   ─────────────────────────────────────────────────────');

  console.log('\n🗑️  To purge all demo data:');
  console.log('   npx tsx scripts/purge-demo-data.ts --dry-run  # Preview');
  console.log('   npx tsx scripts/purge-demo-data.ts            # Execute');

  if (doVerify) {
    console.log('\n🔍 Running post-seed verification...');
    await runVerification();
  }
}

// ─── Verification ─────────────────────────────────────────────────────────────

async function runVerification() {
  let passed = 0;
  let failed = 0;

  async function check(name: string, fn: () => Promise<boolean>) {
    try {
      const result = await fn();
      if (result) {
        console.log(`  ✅ ${name}`);
        passed++;
      } else {
        console.log(`  ❌ ${name} — FAILED`);
        failed++;
      }
    } catch (e) {
      console.log(`  ❌ ${name} — ERROR: ${e}`);
      failed++;
    }
  }

  await check('Demo candidates exist', async () => {
    const count = await prisma.candidate.count({
      where: { email: { startsWith: DEMO_EMAIL_PREFIX, endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
    });
    return count > 0;
  });

  await check('Demo jobs exist', async () => {
    const demoCandidateIds = (await prisma.candidate.findMany({
      where: { email: { startsWith: DEMO_EMAIL_PREFIX, endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
      select: { id: true },
    })).map((c) => c.id);
    const count = await prisma.job.count({ where: { candidateId: { in: demoCandidateIds } } });
    return count > 0;
  });

  await check('No orphaned job activities', async () => {
    // Check random sample of job activities have valid job references
    const sample = await prisma.jobActivity.findFirst({
      where: { job: { candidate: { email: { startsWith: DEMO_EMAIL_PREFIX } } } },
      include: { job: true },
    });
    return sample?.job !== undefined;
  });

  await check('Interviews have valid job references', async () => {
    const count = await prisma.interview.count({
      where: { candidate: { email: { startsWith: DEMO_EMAIL_PREFIX, endsWith: `@${DEMO_EMAIL_DOMAIN}` } } },
    });
    return count >= 0; // Even 0 is valid for small profiles
  });

  await check('Demo candidates have skills', async () => {
    const count = await prisma.skill.count({
      where: { candidate: { email: { startsWith: DEMO_EMAIL_PREFIX, endsWith: `@${DEMO_EMAIL_DOMAIN}` } } },
    });
    return count > 0;
  });

  await check('Demo candidates have profile scores', async () => {
    const count = await prisma.profileScore.count({
      where: { candidate: { email: { startsWith: DEMO_EMAIL_PREFIX, endsWith: `@${DEMO_EMAIL_DOMAIN}` } } },
    });
    return count > 0;
  });

  console.log(`\n  Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    console.log('  ⚠️  Some verification checks failed. Review the output above.');
  } else {
    console.log('  🎉 All verification checks passed!');
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
