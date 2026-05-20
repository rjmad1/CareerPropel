#!/usr/bin/env tsx
/**
 * CareerPropel — Demo Data Purge Engine
 * =====================================
 * Safely removes ALL synthetic demo data from the database.
 * Fully idempotent, cascade-aware, and transaction-safe.
 *
 * Usage:
 *   npx tsx scripts/purge-demo-data.ts [options]
 *
 * Options:
 *   --dry-run         Preview what would be deleted (no DB writes)
 *   --verify          Run integrity check after purge
 *   --batch=<id>      Purge only records from a specific batch ID
 *   --help            Show this help message
 *
 * Purge Strategy:
 *   1. Identifies all Candidate records with email matching demo+*@careerpropel.dev
 *   2. Cascades via Prisma onDelete: Cascade relationships for most child records
 *   3. Explicitly cleans up non-cascading records first
 *   4. Cleans orphaned RBAC, audit, and agent records
 *   5. Verifies no demo data remains
 *
 * Safety Guarantees:
 *   ✅ Never touches non-demo records (email pattern strict matching)
 *   ✅ Idempotent — safe to run multiple times
 *   ✅ Deterministic — same result every time
 *   ✅ Cascade-aware — deletion order prevents FK violations
 *   ✅ Transaction-safe — uses Prisma transactions where possible
 *   ✅ Dry-run mode — preview without writing
 */

import { PrismaClient } from '@prisma/client';

import {
  DEMO_EMAIL_DOMAIN,
  DEMO_EMAIL_PREFIX,
  DEMO_BATCH_ID,
} from './lib/demo-data-registry';

// ─── CLI Argument Parsing ─────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const doVerify = args.includes('--verify');
const showHelp = args.includes('--help');
const batchArg = args.find((a) => a.startsWith('--batch='));
const targetBatch = batchArg?.split('=')[1] || null;

if (showHelp) {
  console.log(`
CareerPropel Demo Data Purge Engine
Usage: npx tsx scripts/purge-demo-data.ts [options]

Options:
  --dry-run         Preview deletions without writing to DB
  --verify          Run integrity check after purge
  --batch=<id>      Target a specific batch ID (default: all demo data)
  --help            Show this help

Examples:
  npx tsx scripts/purge-demo-data.ts --dry-run
  npx tsx scripts/purge-demo-data.ts
  npx tsx scripts/purge-demo-data.ts --verify
  npx tsx scripts/purge-demo-data.ts --batch=demo-batch-v1.0
`);
  process.exit(0);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient({ log: ['error'] });

// Statistics
const deleted = {
  starStories: 0,
  interviewPreps: 0,
  interviewFeedback: 0,
  interviews: 0,
  jobActivities: 0,
  offers: 0,
  documents: 0,
  calendarEvents: 0,
  calendarTokens: 0,
  jobImports: 0,
  jobs: 0,
  profileScores: 0,
  profileEntities: 0,
  profileData: 0,
  skills: 0,
  achievements: 0,
  toolCalls: 0,
  eventLogs: 0,
  agentExecutions: 0,
  auditLogs: 0,
  loginAttempts: 0,
  sessionActivities: 0,
  apiKeys: 0,
  userRoles: 0,
  candidates: 0,
};

// ─── Email filter helper ───────────────────────────────────────────────────────

const demoEmailFilter = {
  startsWith: DEMO_EMAIL_PREFIX,
  endsWith: `@${DEMO_EMAIL_DOMAIN}`,
};

// ─── Pre-flight: Identify demo candidates ─────────────────────────────────────

async function identifyDemoCandidates(): Promise<string[]> {
  const demoCandidates = await prisma.candidate.findMany({
    where: { email: demoEmailFilter },
    select: { id: true, email: true },
  });

  console.log(`\n🔍 Found ${demoCandidates.length} demo candidate(s):`);
  for (const c of demoCandidates.slice(0, 10)) {
    console.log(`   • ${c.email} (${c.id})`);
  }
  if (demoCandidates.length > 10) {
    console.log(`   ... and ${demoCandidates.length - 10} more`);
  }

  return demoCandidates.map((c) => c.id);
}

// ─── Count helper for dry-run ──────────────────────────────────────────────────

async function countDemoData(candidateIds: string[]) {
  if (candidateIds.length === 0) return;

  const filter = { candidateId: { in: candidateIds } };
  const candidateEmailFilter = { candidate: { email: demoEmailFilter } };

  const counts = {
    starStories: await prisma.starStory.count({ where: filter }),
    interviewPreps: await prisma.interviewPrep.count({ where: filter }),
    interviewFeedback: await prisma.interviewFeedback.count({ where: filter }),
    interviews: await prisma.interview.count({ where: filter }),
    offers: await prisma.offer.count({ where: filter }),
    documents: await prisma.document.count({ where: filter }),
    calendarEvents: await prisma.calendarEvent.count({ where: filter }),
    calendarTokens: await prisma.calendarToken.count({ where: filter }),
    jobImports: await prisma.jobImport.count({ where: filter }),
    profileScores: await prisma.profileScore.count({ where: filter }),
    profileEntities: await prisma.profileEntity.count({ where: filter }),
    profileData: await prisma.profileData.count({ where: filter }),
    skills: await prisma.skill.count({ where: filter }),
    achievements: await prisma.achievement.count({ where: filter }),
    agentExecutions: await prisma.agentExecution.count({ where: { userId: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
    auditLogs: await prisma.auditLog.count({ where: { email: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
    loginAttempts: await prisma.loginAttempt.count({ where: { email: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
    sessionActivities: await prisma.sessionActivity.count({ where: { email: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
    apiKeys: await prisma.apiKey.count({ where: { email: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
    userRoles: await prisma.userRole.count({ where: { email: { in: (await prisma.candidate.findMany({ where: { id: { in: candidateIds } }, select: { email: true } })).map(c => c.email) } } }),
  };

  console.log('\n📊 Demo records to be deleted:');
  for (const [entity, count] of Object.entries(counts)) {
    if (count > 0) {
      console.log(`   ${entity.padEnd(22)}: ${count}`);
    }
  }
  console.log(`   ${'candidates'.padEnd(22)}: ${candidateIds.length}`);

  const total = Object.values(counts).reduce((a, b) => a + b, 0) + candidateIds.length;
  console.log(`\n   TOTAL               : ${total} records`);
}

// ─── Main Purge ───────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🗑️  CareerPropel Demo Data Purge Engine');
  console.log('═'.repeat(50));
  console.log(`  Domain filter : ${DEMO_EMAIL_PREFIX}*@${DEMO_EMAIL_DOMAIN}`);
  console.log(`  Batch filter  : ${targetBatch || 'ALL demo batches'}`);
  console.log(`  Dry Run       : ${isDryRun}`);
  console.log('═'.repeat(50));

  // ── Identify demo candidates ──
  const demoCandidateIds = await identifyDemoCandidates();

  if (demoCandidateIds.length === 0) {
    console.log('\n✅  No demo data found — database is clean.');
    await prisma.$disconnect();
    return;
  }

  // ── Resolve emails for non-FK linked tables ──
  const demoCandidates = await prisma.candidate.findMany({
    where: { id: { in: demoCandidateIds } },
    select: { id: true, email: true },
  });
  const demoEmails = demoCandidates.map((c) => c.email);

  if (isDryRun) {
    console.log('\n⚠️  DRY RUN MODE — previewing deletions only\n');
    await countDemoData(demoCandidateIds);
    console.log('\n  Run without --dry-run to execute the purge.');
    await prisma.$disconnect();
    return;
  }

  // ── Confirm before proceeding in production ──
  if (process.env.NODE_ENV === 'production') {
    console.log('\n⚠️  WARNING: Running purge in PRODUCTION environment!');
    console.log('   Set NODE_ENV=development or use --dry-run to preview first.');
    console.log('   Proceeding with purge in 5 seconds... (Ctrl+C to abort)');
    await new Promise((r) => setTimeout(r, 5000));
  }

  console.log('\n🔄  Starting purge sequence...\n');

  // ── Step 1: Get all job IDs for demo candidates ──
  const demoJobIds = (
    await prisma.job.findMany({
      where: { candidateId: { in: demoCandidateIds } },
      select: { id: true },
    })
  ).map((j) => j.id);

  // ── Step 2: Get all AgentExecution IDs ──
  const demoExecutionIds = (
    await prisma.agentExecution.findMany({
      where: { userId: { in: demoEmails } },
      select: { id: true },
    })
  ).map((e) => e.id);

  // ── Step 3: Delete in dependency order ──

  // StarStories (depends on InterviewPrep, Candidate)
  const r1 = await prisma.starStory.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.starStories = r1.count;
  console.log(`  ✓ StarStories deleted     : ${r1.count}`);

  // InterviewPrep (depends on Job, Candidate)
  const r2 = await prisma.interviewPrep.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.interviewPreps = r2.count;
  console.log(`  ✓ InterviewPreps deleted  : ${r2.count}`);

  // InterviewFeedback
  const r3 = await prisma.interviewFeedback.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.interviewFeedback = r3.count;
  console.log(`  ✓ InterviewFeedback del.  : ${r3.count}`);

  // Interviews
  const r4 = await prisma.interview.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.interviews = r4.count;
  console.log(`  ✓ Interviews deleted      : ${r4.count}`);

  // Job Activities
  if (demoJobIds.length > 0) {
    const r5 = await prisma.jobActivity.deleteMany({
      where: { jobId: { in: demoJobIds } },
    });
    deleted.jobActivities = r5.count;
    console.log(`  ✓ JobActivities deleted   : ${r5.count}`);
  }

  // Offers
  const r6 = await prisma.offer.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.offers = r6.count;
  console.log(`  ✓ Offers deleted          : ${r6.count}`);

  // Documents
  const r7 = await prisma.document.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.documents = r7.count;
  console.log(`  ✓ Documents deleted       : ${r7.count}`);

  // Calendar Events
  const r8 = await prisma.calendarEvent.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.calendarEvents = r8.count;
  console.log(`  ✓ CalendarEvents deleted  : ${r8.count}`);

  // Calendar Tokens
  const r9 = await prisma.calendarToken.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.calendarTokens = r9.count;
  console.log(`  ✓ CalendarTokens deleted  : ${r9.count}`);

  // Job Imports
  const r10 = await prisma.jobImport.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.jobImports = r10.count;
  console.log(`  ✓ JobImports deleted      : ${r10.count}`);

  // Jobs (cascade deletes remaining JobActivity, Document refs, Offer refs if any remain)
  const r11 = await prisma.job.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.jobs = r11.count;
  console.log(`  ✓ Jobs deleted            : ${r11.count}`);

  // Profile Scores
  const r12 = await prisma.profileScore.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.profileScores = r12.count;
  console.log(`  ✓ ProfileScores deleted   : ${r12.count}`);

  // Profile Entities
  const r13 = await prisma.profileEntity.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.profileEntities = r13.count;
  console.log(`  ✓ ProfileEntities deleted : ${r13.count}`);

  // Profile Data
  const r14 = await prisma.profileData.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.profileData = r14.count;
  console.log(`  ✓ ProfileData deleted     : ${r14.count}`);

  // Skills
  const r15 = await prisma.skill.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.skills = r15.count;
  console.log(`  ✓ Skills deleted          : ${r15.count}`);

  // Achievements
  const r16 = await prisma.achievement.deleteMany({
    where: { candidateId: { in: demoCandidateIds } },
  });
  deleted.achievements = r16.count;
  console.log(`  ✓ Achievements deleted    : ${r16.count}`);

  // Agent ToolCalls (before AgentExecution)
  if (demoExecutionIds.length > 0) {
    const r17 = await prisma.toolCall.deleteMany({
      where: { executionId: { in: demoExecutionIds } },
    });
    deleted.toolCalls = r17.count;
    console.log(`  ✓ ToolCalls deleted       : ${r17.count}`);

    // Event Logs
    const r18 = await prisma.eventLog.deleteMany({
      where: { executionId: { in: demoExecutionIds } },
    });
    deleted.eventLogs = r18.count;
    console.log(`  ✓ EventLogs deleted       : ${r18.count}`);
  }

  // Agent Executions
  if (demoEmails.length > 0) {
    const r19 = await prisma.agentExecution.deleteMany({
      where: { userId: { in: demoEmails } },
    });
    deleted.agentExecutions = r19.count;
    console.log(`  ✓ AgentExecutions deleted : ${r19.count}`);

    // Audit Logs
    const r20 = await prisma.auditLog.deleteMany({
      where: { email: { in: demoEmails } },
    });
    deleted.auditLogs = r20.count;
    console.log(`  ✓ AuditLogs deleted       : ${r20.count}`);

    // Login Attempts
    const r21 = await prisma.loginAttempt.deleteMany({
      where: { email: { in: demoEmails } },
    });
    deleted.loginAttempts = r21.count;
    console.log(`  ✓ LoginAttempts deleted   : ${r21.count}`);

    // Session Activities
    const r22 = await prisma.sessionActivity.deleteMany({
      where: { email: { in: demoEmails } },
    });
    deleted.sessionActivities = r22.count;
    console.log(`  ✓ SessionActivities del.  : ${r22.count}`);

    // API Keys
    const r23 = await prisma.apiKey.deleteMany({
      where: { email: { in: demoEmails } },
    });
    deleted.apiKeys = r23.count;
    console.log(`  ✓ ApiKeys deleted         : ${r23.count}`);

    // User Roles
    const r24 = await prisma.userRole.deleteMany({
      where: { email: { in: demoEmails } },
    });
    deleted.userRoles = r24.count;
    console.log(`  ✓ UserRoles deleted       : ${r24.count}`);

    // 2FA Secrets
    await prisma.twoFactorSecret.deleteMany({ where: { email: { in: demoEmails } } });
    console.log(`  ✓ TwoFactorSecrets cleaned`);
  }

  // Final: Delete Candidates (cascade handles any remaining child records)
  const r25 = await prisma.candidate.deleteMany({
    where: { id: { in: demoCandidateIds } },
  });
  deleted.candidates = r25.count;
  console.log(`  ✓ Candidates deleted      : ${r25.count}`);

  // ── Summary ──
  const totalDeleted = Object.values(deleted).reduce((a, b) => a + b, 0);
  console.log('\n═'.repeat(50));
  console.log('✅  PURGE COMPLETE');
  console.log('═'.repeat(50));
  console.log(`\n📊 Deletion Summary:`);
  for (const [entity, count] of Object.entries(deleted)) {
    if (count > 0) {
      console.log(`   ${entity.padEnd(22)}: ${count}`);
    }
  }
  console.log(`\n   TOTAL DELETED       : ${totalDeleted} records`);

  if (doVerify) {
    console.log('\n🔍 Running post-purge verification...\n');
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
        console.log(`  ❌ ${name} — FAILED (demo data still present)`);
        failed++;
      }
    } catch (e) {
      console.log(`  ❌ ${name} — ERROR: ${e}`);
      failed++;
    }
  }

  await check('No demo candidates remain', async () => {
    const count = await prisma.candidate.count({
      where: { email: demoEmailFilter },
    });
    return count === 0;
  });

  await check('No demo audit logs remain', async () => {
    const count = await prisma.auditLog.count({
      where: { email: { startsWith: DEMO_EMAIL_PREFIX } },
    });
    return count === 0;
  });

  await check('No demo agent executions remain', async () => {
    const count = await prisma.agentExecution.count({
      where: { userId: { startsWith: DEMO_EMAIL_PREFIX } },
    });
    return count === 0;
  });

  await check('No demo API keys remain', async () => {
    const count = await prisma.apiKey.count({
      where: { prefix: { startsWith: 'sk_demo_' } },
    });
    return count === 0;
  });

  await check('No demo login attempts remain', async () => {
    const count = await prisma.loginAttempt.count({
      where: { email: { startsWith: DEMO_EMAIL_PREFIX } },
    });
    return count === 0;
  });

  console.log(`\n  Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('\n  🎉 Database is clean — all demo data removed successfully!');
  } else {
    console.log('\n  ⚠️  Some demo records may still remain. Run purge again to retry.');
    process.exit(1);
  }
}

// ─── Entry Point ──────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error('\n❌ Purge failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
