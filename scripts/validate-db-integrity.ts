#!/usr/bin/env tsx
/**
 * Phase 1: Comprehensive Database Integrity Validation
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

interface Finding {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'INFO';
  detail: string;
  count?: number;
}

const findings: Finding[] = [];

function pass(check: string, detail: string, count?: number) {
  findings.push({ check, status: 'PASS', detail, count });
  console.log(`  ✅ PASS  [${check}] ${detail}`);
}
function fail(check: string, detail: string, count?: number) {
  findings.push({ check, status: 'FAIL', detail, count });
  console.error(`  ❌ FAIL  [${check}] ${detail}`);
}
function warn(check: string, detail: string, count?: number) {
  findings.push({ check, status: 'WARN', detail, count });
  console.warn(`  ⚠️  WARN  [${check}] ${detail}`);
}
function info(check: string, detail: string, count?: number) {
  findings.push({ check, status: 'INFO', detail, count });
  console.log(`  ℹ️  INFO  [${check}] ${detail}`);
}

async function main() {
  console.log('\n══════════════════════════════════════════════════');
  console.log('  PHASE 1: DATABASE INTEGRITY VALIDATION');
  console.log('══════════════════════════════════════════════════\n');

  // ── 1.1 SEED STATUS ──────────────────────────────────────────
  console.log('── 1.1 Seed Status ──');
  const allCandidates = await db.candidate.findMany({ select: { id: true, email: true } });
  const demoIds = allCandidates.filter(c => c.email.startsWith('demo+')).map(c => c.id);
  const nonDemoIds = allCandidates.filter(c => !c.email.startsWith('demo+')).map(c => c.id);

  const counts = await Promise.all([
    db.job.count({ where: { candidateId: { in: demoIds } } }),
    db.interview.count({ where: { candidateId: { in: demoIds } } }),
    db.offer.count({ where: { candidateId: { in: demoIds } } }),
    db.document.count({ where: { candidateId: { in: demoIds } } }),
    db.interviewPrep.count({ where: { candidateId: { in: demoIds } } }),
    db.starStory.count({ where: { candidateId: { in: demoIds } } }),
    db.calendarEvent.count({ where: { candidateId: { in: demoIds } } }),
    db.jobActivity.count({ where: { job: { candidateId: { in: demoIds } } } }),
    db.auditLog.count({ where: { email: { startsWith: 'demo+' } } }),
    db.agentExecution.count({ where: { userId: { startsWith: 'demo+' } } }),
  ]);

  const [demoJobs, demoInterviews, demoOffers, demoDocs, demoPreps, demoStories,
         demoCalEvents, demoJobActivities, demoAuditLogs, demoAgents] = counts;

  info('SEED_STATUS', `demo candidates: ${demoIds.length}, non-demo: ${nonDemoIds.length}`);
  info('SEED_JOBS', `demo jobs: ${demoJobs}`, demoJobs);
  info('SEED_INTERVIEWS', `demo interviews: ${demoInterviews}`, demoInterviews);
  info('SEED_OFFERS', `demo offers: ${demoOffers}`, demoOffers);
  info('SEED_DOCUMENTS', `demo documents: ${demoDocs}`, demoDocs);
  info('SEED_PREPS', `demo interview preps: ${demoPreps}`, demoPreps);
  info('SEED_STORIES', `demo star stories: ${demoStories}`, demoStories);
  info('SEED_CALENDAR', `demo calendar events: ${demoCalEvents}`, demoCalEvents);
  info('SEED_ACTIVITIES', `demo job activities: ${demoJobActivities}`, demoJobActivities);
  info('SEED_AUDIT', `demo audit logs: ${demoAuditLogs}`, demoAuditLogs);
  info('SEED_AGENTS', `demo agent executions: ${demoAgents}`, demoAgents);

  if (demoIds.length === 0) {
    fail('SEED_PRESENCE', 'NO DEMO DATA FOUND — seed has not been run or failed');
  } else if (demoIds.length < 5) {
    warn('SEED_PRESENCE', `Only ${demoIds.length} demo candidates — expected ≥6 for medium profile`);
  } else {
    pass('SEED_PRESENCE', `${demoIds.length} demo candidates seeded`);
  }

  if (demoJobs === 0) fail('SEED_JOBS', 'No demo jobs found');
  else pass('SEED_JOBS_PRESENT', `${demoJobs} demo jobs present`);

  // ── 1.2 ORPHAN DETECTION ─────────────────────────────────────
  console.log('\n── 1.2 Orphan Detection ──');
  const allIds = allCandidates.map(c => c.id);
  const allJobIds = (await db.job.findMany({ select: { id: true } })).map(j => j.id);

  const orphanJobs = await db.job.count({ where: { candidateId: { notIn: allIds } } });
  orphanJobs === 0
    ? pass('ORPHAN_JOBS', 'No orphaned jobs')
    : fail('ORPHAN_JOBS', `${orphanJobs} jobs reference missing candidates`, orphanJobs);

  const orphanInterviews = await db.interview.count({
    where: { OR: [
      { candidateId: { notIn: allIds } },
      { jobId: { notIn: allJobIds } },
    ]},
  });
  orphanInterviews === 0
    ? pass('ORPHAN_INTERVIEWS', 'No orphaned interviews')
    : fail('ORPHAN_INTERVIEWS', `${orphanInterviews} orphaned interview records`, orphanInterviews);

  const orphanOffers = await db.offer.count({
    where: { OR: [
      { candidateId: { notIn: allIds } },
      { jobId: { notIn: allJobIds } },
    ]},
  });
  orphanOffers === 0
    ? pass('ORPHAN_OFFERS', 'No orphaned offers')
    : fail('ORPHAN_OFFERS', `${orphanOffers} orphaned offer records`, orphanOffers);

  const orphanFeedback = await db.interviewFeedback.count({
    where: { OR: [
      { candidateId: { notIn: allIds } },
      { jobId: { notIn: allJobIds } },
    ]},
  });
  orphanFeedback === 0
    ? pass('ORPHAN_FEEDBACK', 'No orphaned interview feedback')
    : fail('ORPHAN_FEEDBACK', `${orphanFeedback} orphaned feedback records`, orphanFeedback);

  const orphanActivities = await db.jobActivity.count({ where: { jobId: { notIn: allJobIds } } });
  orphanActivities === 0
    ? pass('ORPHAN_ACTIVITIES', 'No orphaned job activities')
    : fail('ORPHAN_ACTIVITIES', `${orphanActivities} orphaned activity records`, orphanActivities);

  const allPrepIds = (await db.interviewPrep.findMany({ select: { id: true } })).map(p => p.id);
  const orphanStories = await db.starStory.count({
    where: { AND: [
      { interviewPrepId: { not: null } },
      { interviewPrepId: { notIn: allPrepIds } },
    ]},
  });
  orphanStories === 0
    ? pass('ORPHAN_STORIES', 'No orphaned star stories')
    : fail('ORPHAN_STORIES', `${orphanStories} star stories reference missing preps`, orphanStories);

  const orphanToolCalls = await db.toolCall.count({
    where: { executionId: { notIn: (await db.agentExecution.findMany({ select: { id: true } })).map(a => a.id) } },
  });
  orphanToolCalls === 0
    ? pass('ORPHAN_TOOLCALLS', 'No orphaned tool calls')
    : fail('ORPHAN_TOOLCALLS', `${orphanToolCalls} tool calls reference missing agent executions`, orphanToolCalls);

  // ── 1.3 ENUM / WORKFLOW STATE VALIDATION ─────────────────────
  console.log('\n── 1.3 Enum / Workflow State Validation ──');

  const validJobStages = new Set(['sourced','interested','resume_tailoring','applied',
    'recruiter_screen','hiring_manager','technical_interview','system_design',
    'behavioral','final_round','offer','negotiation','rejected','archived']);
  const badStageJobs = await db.job.findMany({
    where: { stage: { notIn: [...validJobStages] } },
    select: { id: true, stage: true },
  });
  badStageJobs.length === 0
    ? pass('JOB_STAGES', 'All job stages are valid')
    : fail('JOB_STAGES', `${badStageJobs.length} jobs have invalid stages: ${[...new Set(badStageJobs.map(j => j.stage))].join(',')}`, badStageJobs.length);

  const validInterviewStatuses = new Set(['scheduled','completed','cancelled','rescheduled']);
  const badInterviews = await db.interview.count({ where: { status: { notIn: [...validInterviewStatuses] } } });
  badInterviews === 0
    ? pass('INTERVIEW_STATUS', 'All interview statuses valid')
    : fail('INTERVIEW_STATUS', `${badInterviews} interviews have invalid status`, badInterviews);

  const validOfferStatuses = new Set(['pending','received','accepted','rejected','negotiating']);
  const badOffers = await db.offer.count({ where: { status: { notIn: [...validOfferStatuses] } } });
  badOffers === 0
    ? pass('OFFER_STATUS', 'All offer statuses valid')
    : fail('OFFER_STATUS', `${badOffers} offers have invalid status`, badOffers);

  const validAgentStatuses = new Set(['queued','running','completed','failed']);
  const badAgents = await db.agentExecution.count({ where: { status: { notIn: [...validAgentStatuses] } } });
  badAgents === 0
    ? pass('AGENT_STATUS', 'All agent execution statuses valid')
    : fail('AGENT_STATUS', `${badAgents} agent executions have invalid status`, badAgents);

  const validPrepStatuses = new Set(['not_started','generating','ready','stale']);
  const badPreps = await db.interviewPrep.count({ where: { prepStatus: { notIn: [...validPrepStatuses] } } });
  badPreps === 0
    ? pass('PREP_STATUS', 'All interview prep statuses valid')
    : fail('PREP_STATUS', `${badPreps} preps have invalid status`, badPreps);

  // Stuck agents: running with no update in > 1 hour
  const stuckAgents = await db.agentExecution.count({
    where: { status: 'running', updatedAt: { lt: new Date(Date.now() - 3600000) } },
  });
  stuckAgents === 0
    ? pass('STUCK_AGENTS', 'No stuck running agents')
    : warn('STUCK_AGENTS', `${stuckAgents} agents stuck in 'running' for > 1h`, stuckAgents);

  // ── 1.4 TIMELINE CONSISTENCY ─────────────────────────────────
  console.log('\n── 1.4 Timeline Consistency ──');

  const futureJobs = await db.job.count({ where: { createdAt: { gt: new Date() } } });
  futureJobs === 0
    ? pass('FUTURE_CREATED', 'No future-dated created records')
    : fail('FUTURE_CREATED', `${futureJobs} jobs have future createdAt`, futureJobs);

  const negativeDuration = await db.interview.count({ where: { duration: { lt: 0 } } });
  negativeDuration === 0
    ? pass('INTERVIEW_DURATION', 'No negative interview durations')
    : fail('INTERVIEW_DURATION', `${negativeDuration} interviews have negative duration`, negativeDuration);

  const expiredTokens = await db.calendarToken.count({ where: { expiresAt: { lt: new Date() } } });
  expiredTokens > 0
    ? warn('CALENDAR_TOKENS', `${expiredTokens} calendar tokens are expired (expected for demo data)`, expiredTokens)
    : pass('CALENDAR_TOKENS', 'Calendar tokens all valid');

  // ── 1.5 NULL SAFETY ──────────────────────────────────────────
  console.log('\n── 1.5 Null Safety ──');

  const emptyTitleJobs = await db.job.count({ where: { OR: [{ title: '' }, { company: '' }] } });
  emptyTitleJobs === 0
    ? pass('JOB_NULL_SAFETY', 'All jobs have title and company')
    : fail('JOB_NULL_SAFETY', `${emptyTitleJobs} jobs missing title or company`, emptyTitleJobs);

  const emptyCompetency = await db.starStory.count({ where: { competency: '' } });
  emptyCompetency === 0
    ? pass('STORY_COMPETENCY', 'All star stories have competency')
    : fail('STORY_COMPETENCY', `${emptyCompetency} stories missing competency`, emptyCompetency);

  // ── 1.6 UNIQUE CONSTRAINT HEALTH ─────────────────────────────
  console.log('\n── 1.6 Unique Constraint Health ──');

  const emailDups = await db.$queryRaw<Array<{email: string, cnt: bigint}>>`
    SELECT email, COUNT(*) as cnt FROM "Candidate" GROUP BY email HAVING COUNT(*) > 1
  `;
  emailDups.length === 0
    ? pass('UNIQUE_EMAILS', 'No duplicate candidate emails')
    : fail('UNIQUE_EMAILS', `${emailDups.length} duplicate email groups detected`, emailDups.length);

  const skillDups = await db.$queryRaw<Array<{cnt: bigint}>>`
    SELECT COUNT(*) as cnt FROM (
      SELECT "candidateId", name, COUNT(*) FROM "Skill" GROUP BY "candidateId", name HAVING COUNT(*) > 1
    ) dupes
  `;
  const skillDupCount = Number((skillDups[0] as any)?.cnt ?? 0);
  skillDupCount === 0
    ? pass('UNIQUE_SKILLS', 'No duplicate candidate+skill pairs')
    : fail('UNIQUE_SKILLS', `${skillDupCount} duplicate skill entries`, skillDupCount);

  // ── 1.7 SCORE RANGE VALIDATION ───────────────────────────────
  console.log('\n── 1.7 Data Range Validation ──');

  const outOfRange = await db.profileScore.count({ where: { OR: [{ overall: { lt: 0 } }, { overall: { gt: 100 } }] } });
  outOfRange === 0
    ? pass('SCORE_RANGE', 'All profile scores in valid range 0-100')
    : fail('SCORE_RANGE', `${outOfRange} profile scores out of 0-100 range`, outOfRange);

  const badSelfRating = await db.interviewFeedback.count({ where: { OR: [
    { AND: [{ selfRating: { not: null } }, { selfRating: { lt: 1 } }] },
    { AND: [{ selfRating: { not: null } }, { selfRating: { gt: 5 } }] },
  ]}});
  badSelfRating === 0
    ? pass('FEEDBACK_RATING', 'All self-ratings in valid range 1-5')
    : fail('FEEDBACK_RATING', `${badSelfRating} feedback records with out-of-range self-rating`, badSelfRating);

  const badConfidence = await db.starStory.count({ where: { OR: [
    { AND: [{ confidence: { not: null } }, { confidence: { lt: 0 } }] },
    { AND: [{ confidence: { not: null } }, { confidence: { gt: 100 } }] },
  ]}});
  badConfidence === 0
    ? pass('STORY_CONFIDENCE', 'All story confidence scores in range 0-100')
    : fail('STORY_CONFIDENCE', `${badConfidence} stories with invalid confidence`, badConfidence);

  // ── 1.8 GOVERNANCE FIELDS (CRITICAL) ────────────────────────
  console.log('\n── 1.8 Demo Governance Fields ──');

  // Check for column existence
  const hasGovernanceCol = await db.$queryRaw<Array<{exists: boolean}>>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'Candidate' AND column_name = 'is_demo_data'
    ) as exists
  `;
  const govExists = (hasGovernanceCol[0] as any)?.exists;
  if (!govExists) {
    fail('GOVERNANCE_FIELDS', 'Schema has NO is_demo_data / purge_group / demo_batch_id / synthetic_origin columns — governance relies solely on email pattern matching');
    warn('GOVERNANCE_RISK', 'Demo isolation is FRAGILE: if a demo user changes their email, records become un-purgeable');
  } else {
    pass('GOVERNANCE_FIELDS', 'Governance columns present on Candidate table');
  }

  // ── 1.9 WORKFLOW STATE COHERENCE ────────────────────────────
  console.log('\n── 1.9 Workflow State Coherence ──');

  // Jobs with 'offer' stage but no Offer record
  const offerStageNoRecord = await db.job.count({
    where: { stage: 'offer', offers: { none: {} } },
  });
  offerStageNoRecord === 0
    ? pass('OFFER_COHERENCE', 'All offer-stage jobs have corresponding Offer records')
    : warn('OFFER_COHERENCE', `${offerStageNoRecord} jobs in 'offer' stage have no Offer record`, offerStageNoRecord);

  // Offers with status 'accepted'/'rejected' but job not in terminal state
  const terminalOfferBadStage = await db.offer.count({
    where: {
      status: { in: ['accepted', 'rejected'] },
      job: { stage: { notIn: ['offer', 'negotiation', 'rejected', 'archived'] } },
    },
  });
  terminalOfferBadStage === 0
    ? pass('OFFER_JOB_COHERENCE', 'Terminal offers match job stages')
    : warn('OFFER_JOB_COHERENCE', `${terminalOfferBadStage} terminal offers have inconsistent job stage`, terminalOfferBadStage);

  // Interviews for archived/rejected jobs (should be allowed but flagged)
  const interviewsOnDeadJobs = await db.interview.count({
    where: { job: { stage: { in: ['rejected', 'archived'] } }, status: 'scheduled' },
  });
  interviewsOnDeadJobs === 0
    ? pass('DEAD_JOB_INTERVIEWS', 'No scheduled interviews on rejected/archived jobs')
    : warn('DEAD_JOB_INTERVIEWS', `${interviewsOnDeadJobs} scheduled interviews on dead jobs`, interviewsOnDeadJobs);

  // ── SUMMARY ──────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════');
  console.log('  PHASE 1 SUMMARY');
  console.log('══════════════════════════════════════════════════');
  const passes = findings.filter(f => f.status === 'PASS').length;
  const fails = findings.filter(f => f.status === 'FAIL').length;
  const warns = findings.filter(f => f.status === 'WARN').length;
  const infos = findings.filter(f => f.status === 'INFO').length;
  console.log(`  ✅ PASS: ${passes}  ❌ FAIL: ${fails}  ⚠️  WARN: ${warns}  ℹ️  INFO: ${infos}`);

  if (fails > 0) {
    console.log('\n  FAILURES:');
    findings.filter(f => f.status === 'FAIL').forEach(f => console.log(`    ❌ [${f.check}] ${f.detail}`));
  }
  if (warns > 0) {
    console.log('\n  WARNINGS:');
    findings.filter(f => f.status === 'WARN').forEach(f => console.log(`    ⚠️  [${f.check}] ${f.detail}`));
  }

  await db.$disconnect();
  return { passes, fails, warns };
}

main().catch(e => { console.error('\n[FATAL ERROR]', e.message); process.exit(1); });
