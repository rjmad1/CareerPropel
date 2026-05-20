# CareerPropel — Demo Data System Guide

> **Version**: 1.0.0 · **Batch**: demo-batch-v1.0 · **Schema**: No migrations required

---

## Overview

The CareerPropel demo seed system generates comprehensive synthetic enterprise-grade data across all functional domains of the platform. It is designed for:

- ✅ UX validation and product walkthroughs
- ✅ Feature demonstrations and recruiter demos
- ✅ Integration and workflow testing
- ✅ Dashboard and analytics realism
- ✅ End-to-end scenario simulations

> [!IMPORTANT]
> **All demo data is fully isolated and safely purgeable.** It never contaminates production records and can be removed in seconds with a single command.

---

## Quick Start

### Prerequisites

- PostgreSQL database running and accessible via `DATABASE_URL`
- `tsx` available (installed as devDependency)
- Prisma client generated (`npm run build` or `npx prisma generate`)

### 1. Run the Seed

```bash
# Medium profile (recommended for demos)
npm run demo:seed:medium

# Or choose a profile:
npm run demo:seed:small       # Fast, 3 candidates per archetype
npm run demo:seed:medium      # Balanced, 2 candidates per archetype (~10 total)
npm run demo:seed:enterprise  # Full, 5 candidates per archetype (~30 total)
npm run demo:seed:stress      # Stress test, 100+ candidates
```

### 2. Login

Navigate to the app and login with any of the demo credentials below.

### 3. Purge When Done

```bash
npm run demo:purge:dry  # Preview what will be deleted
npm run demo:purge      # Execute purge (irreversible)
```

---

## 🔑 Demo Login Credentials

**Password for ALL demo accounts: `DemoPass123!`**

| Account | Email | Role | Description |
|---------|-------|------|-------------|
| **Admin** | `demo+admin@careerpropel.dev` | Admin | Full platform access, all features unlocked |
| **Senior Candidate** | `demo+samuel.larsson.job.seeker.senior.0@careerpropel.dev` | Candidate | Director/VP-level job search, all 14 pipeline stages, offers + negotiations |
| **Senior Candidate 2** | `demo+oliver.kumar.job.seeker.senior.1@careerpropel.dev` | Candidate | Alternative senior profile |
| **Mid Candidate** | `demo+zara.larsson.job.seeker.mid.0@careerpropel.dev` | Candidate | Senior engineer job search, technical interviews |
| **Mid Candidate 2** | `demo+priya.nkosi.job.seeker.mid.1@careerpropel.dev` | Candidate | Alternative mid-level profile |
| **Entry Candidate** | `demo+ethan.al-hassan.job.seeker.entry.0@careerpropel.dev` | Candidate | Entry-level job search, early-stage applications |
| **Entry Candidate 2** | `demo+marcus.osei.job.seeker.entry.1@careerpropel.dev` | Candidate | Alternative entry-level profile |
| **Recruiter** | `demo+ethan.nakamura.recruiter.0@careerpropel.dev` | Recruiter | Recruiter perspective, limited candidate visibility |
| **Recruiter 2** | `demo+hina.kumar.recruiter.1@careerpropel.dev` | Recruiter | Alternative recruiter profile |
| **Hiring Manager** | `demo+tyler.rivera.hiring.manager.0@careerpropel.dev` | Candidate | Hiring manager perspective |
| **Coordinator** | `demo+jordan.williams.coordinator.0@careerpropel.dev` | Coordinator | Interview scheduling and coordination |

> [!TIP]
> Start with **Samuel Larsson** (`demo+samuel.larsson.job.seeker.senior.0@careerpropel.dev`) for the richest demo experience — senior-level candidate with jobs across all 14 pipeline stages, multiple offers, interviews, and AI prep packages.

---

## Dataset Profiles

| Profile | Candidates | Jobs/User | Interviews | Offers | Docs | Calendar Events | Total Records (est.) |
|---------|-----------|-----------|------------|--------|------|-----------------|----------------------|
| `small` | 7 | 8 | 2/job | 1 | 4 | 3 | ~500 |
| `medium` | 13 | 20 | 3/job | 3 | 10 | 8 | ~3,000 |
| `enterprise` | 31 | 50 | 4/job | 6 | 20 | 15 | ~25,000 |
| `stress-test` | 103 | 100 | 5/job | 10 | 40 | 30 | ~200,000+ |

---

## Covered Functional Domains

### ✅ Users & Profiles
- 6 distinct archetypes: job seeker (senior/mid/entry), recruiter, hiring manager, coordinator
- Geographic diversity: 20+ cities including international locations
- Diverse skill sets per archetype
- Realistic profile summaries, education, and experience histories
- AI-extracted profile entities and profile scores (0-100)

### ✅ Job Pipeline (14 stages)
- `sourced → interested → resume_tailoring → applied → recruiter_screen → hiring_manager → technical_interview → system_design → behavioral → final_round → offer → negotiation → rejected → archived`
- 20 realistic companies across all industries (startup → enterprise)
- Rich job descriptions with requirements and tags
- Realistic salary ranges per experience level
- Recruiter contact info per job

### ✅ Interviews
- All interview types: phone, video, onsite, panel, technical, behavioral
- Mix of completed/scheduled/cancelled/rescheduled
- Historical timelines spanning 90+ days
- Interview feedback with self-ratings

### ✅ Interview Prep & STAR Stories
- AI-generated company research per company
- Role breakdown and technical prep packages
- STAR-format behavioral stories linked to competencies
- Confidence scores and prep status tracking

### ✅ Offers
- All statuses: pending, received, accepted, rejected, negotiating
- Salary + equity + bonus + benefits breakdown
- Negotiation notes

### ✅ Documents
- Resumes, cover letters, notes, offer letters
- `[SYNTHETIC]` prefix on all document names
- Version tracking

### ✅ Calendar
- Fake Google/Outlook tokens (explicitly flagged as synthetic)
- Interview scheduling events
- Mixed past/future events
- Conflict scenarios

### ✅ Agent Executions
- All agent types: resume-tailor, job-match, interview-prep, research, follow-up
- Nested tool calls per execution
- Event logs with INFO/WARN/ERROR levels
- Mix of completed/failed/queued statuses

### ✅ Audit Logs & Security
- Login attempts (80% success, 20% failure)
- Session activities with risk scores
- CRUD audit trail for all major actions
- API keys with `sk_demo_` prefix (explicitly fake)

### ✅ Edge Cases
- Extremely long content (5,000+ character descriptions)
- Minimal/empty records
- Unicode and international characters (日本語, Ελληνικά, العربية)
- Duplicate name scenarios

---

## Data Isolation & Tagging

All demo records are identifiable by:

| Identifier | Value |
|-----------|-------|
| Email prefix | `demo+` |
| Email domain | `@careerpropel.dev` |
| API key prefix | `sk_demo_` |
| Calendar event title | `[DEMO]` prefix |
| Document names | `[SYNTHETIC]` prefix |
| Job company (edge cases) | `[DEMO]` prefix |
| Embedded JSON metadata | `_demo: true`, `_batch_id`, `_seed_version` |

---

## Purge Instructions

### Preview (Dry Run)
```bash
npm run demo:purge:dry
```

### Execute Purge
```bash
npm run demo:purge
```

### Purge with Verification
```bash
npx tsx scripts/purge-demo-data.ts --verify
```

### Purge Specific Batch
```bash
npx tsx scripts/purge-demo-data.ts --batch=demo-batch-v1.0
```

### Purge Safety

The purge engine:
1. Identifies candidates by exact email pattern match: `demo+*@careerpropel.dev`
2. Deletes in dependency order to avoid FK violations:
   - StarStories → InterviewPreps → Interviews → JobActivities
   - Offers → Documents → CalendarEvents → CalendarTokens → JobImports → Jobs
   - ProfileScores → ProfileEntities → ProfileData → Skills → Achievements
   - ToolCalls → EventLogs → AgentExecutions
   - AuditLogs → LoginAttempts → SessionActivities → ApiKeys → UserRoles
   - Candidates (final cascade cleanup)
3. Never touches non-demo records
4. Reports all deletion counts

---

## Architecture

```
scripts/
├── lib/
│   ├── demo-data-registry.ts      # Shared constants, helpers, rng utilities
│   └── demo-data-generators.ts    # All data generation functions & pools
├── seed-demo-data.ts              # Main seed engine (11 phases)
└── purge-demo-data.ts             # Purge engine (cascade-safe)

src/components/ui/
├── DemoBanner.tsx                 # Dismissible demo environment banner
└── DemoDataBadge.tsx              # Inline demo badge + watermark

src/components/Layout/
└── NavLayout.tsx                  # Injected: DemoBanner + DemoDataIndicator
```

---

## Governance Rules

1. 🚫 **NEVER** contaminate production-safe paths
2. 🚫 **NEVER** create non-purgeable demo data
3. 🚫 **NEVER** hardcode real user IDs or production secrets
4. 🚫 **NEVER** bypass schema integrity constraints
5. 🚫 **NEVER** create orphaned records
6. ✅ **ALWAYS** prefix demo emails with `demo+`
7. ✅ **ALWAYS** use `@careerpropel.dev` domain for demo accounts
8. ✅ **ALWAYS** tag `[SYNTHETIC]` documents and `[DEMO]` calendar events
9. ✅ **ALWAYS** use fake tokens for calendar/API integrations
10. ✅ **ALWAYS** run `--dry-run` before executing purge in production

---

## Known Limitations

1. **No real media/file uploads** — Document records have text `content` but no actual file attachments (URLs are null). This is intentional to avoid S3/CDN costs.
2. **Calendar tokens are fake** — The access/refresh tokens are explicitly synthetic strings and cannot connect to real Google/Outlook APIs.
3. **API keys are not functional** — The `sk_demo_*` prefixed keys are demo-only and will not authenticate.
4. **No real email sending** — Recruiter emails in job records are synthetic and will not receive messages.
5. **STAR story metrics are synthetic** — The AI-generated metrics in STAR stories are plausible but not real.
6. **Stress-test profile** — Running `stress-test` profile may take 5-10 minutes and generate 200K+ records. Ensure sufficient DB resources.

---

## Troubleshooting

### "unique constraint failed"
The seed is idempotent — re-running on existing demo data will skip existing records. If you see unexpected constraint errors, run the purge first then re-seed.

### "Cannot find module '@prisma/client'"
Run `npx prisma generate` to regenerate the Prisma client before seeding.

### "DATABASE_URL not set"
Ensure your `.env.local` or environment has `DATABASE_URL` pointing to your PostgreSQL instance.

### TypeScript errors in seed scripts
The scripts use `tsx` for direct TypeScript execution. Run `npm run type-check` to catch any type issues before running the seed.

---

## Demo Readiness Checklist

Before a live demo:

- [ ] Run `npm run demo:seed:medium` to populate all data
- [ ] Login with `demo+admin@careerpropel.dev` / `DemoPass123!` — verify dashboard loads
- [ ] Navigate to Pipeline — verify jobs across all 14 stages
- [ ] Navigate to Interviews — verify scheduled and completed interviews
- [ ] Navigate to Offers — verify active negotiations
- [ ] Navigate to Documents — verify resumes and cover letters
- [ ] Navigate to Analytics — verify charts render with data
- [ ] Navigate to Audit Logs — verify activity trail
- [ ] Navigate to Calendar — verify events display
- [ ] Verify amber DEMO banner appears and is dismissible
- [ ] Run `npm run demo:purge:dry` to confirm purge readiness
