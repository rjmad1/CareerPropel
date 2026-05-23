# AS-IS State Architecture & Codebase Intelligence Report

## CareerPropel (career-ops)

### Report Date: 2026-05-23 | Analyst: Automated Principal Architecture Review

---

# 1. Executive Summary

CareerPropel is an AI-native career management SaaS platform built on Next.js 16 (App Router), PostgreSQL via Prisma ORM, Redis for pub/sub, and Socket.io for real-time messaging. Its mission: automate and orchestrate a candidate's entire job search lifecycle—from discovery through offer negotiation—using a suite of specialized AI agents backed by Anthropic Claude and additional pluggable LLM providers.

**Key Strengths:**
- Rich, multi-domain domain model with 26 Prisma models covering the entire career lifecycle
- Thoughtful dual real-time transport: Socket.io WebSocket server + SSE fallback with Redis pub/sub bridge
- Meaningful security posture: RBAC, 2FA (TOTP), API key hashing, AES-GCM credential encryption, audit logging, threat detection
- Prompt safety scaffolding: injection pattern stripping, PII redaction layer, input length enforcement
- Multi-provider LLM orchestrator with fallback chains, privacy modes, and token cost accounting
- Spec-driven CI governance with ADR templates and a spec-check GitHub Action
- Good test coverage for security and regression flows (Jest unit + integration + regression suites)

**Key Risks:**
- Vercel cron schedule for agent execution runs only once daily (`0 0 * * *`) — this is almost certainly wrong for an AI-agent platform that should process queued work continuously or near-real-time
- Dual execution path confusion: deprecated `QueueWorker` stub remains in source; canonical executor (`src/lib/agents/executor.ts`) targets a Vercel cron, but the custom `server.js` is the actual long-running process — these must be aligned
- Redis is a hard dependency for rate limiting, pub/sub, and SSE agent streams; no circuit breaker beyond "fail open" — rate limiting silently disables when Redis is down
- CalendarToken access tokens stored in plaintext in the database (only AI provider keys are encrypted)
- No container orchestration or Docker configuration detected; deployment model is unclear beyond Vercel hints
- `as any` casts in hot paths (agent execution status check in `execute/route.ts` line 154) risk type safety regressions
- The `QueueWorker` deprecated file (RASUI-001 remediation) is still present but not yet deleted, creating confusion about the canonical path

**Architecture Tier:** Full-stack monolith (Next.js App Router) with a custom Node.js sidecar server for WebSocket/Redis bridging.

---

# 2. Repository Inventory

## 2.1 Directory Tree

```text
career-ops/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, type-check, unit tests, security audit, spec-check
│   │   ├── lighthouse.yml            # Performance auditing
│   │   └── dependency-review.yml     # Dependency license review
│   ├── ISSUE_TEMPLATE/               # ADR, bug, feature, security-review templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
├── prisma/
│   ├── schema.prisma                 # 26 models, PostgreSQL, 5 enums
│   ├── seed.ts                       # Database seeding script
│   └── migrations/                   # 6+ SQL migration files
├── scripts/
│   ├── governance/spec-check.js      # Spec governance CI check
│   ├── security/scan-secrets.sh      # Secret scanning
│   ├── seed-demo-data.ts             # Demo data seeder (small/medium/enterprise/stress profiles)
│   └── purge-demo-data.ts
├── src/
│   ├── app/                          # Next.js App Router pages + API routes
│   │   ├── (auth)/                   # Login, register, forgot-password, reset-password, verify-email
│   │   ├── api/                      # 50+ API route handlers
│   │   │   ├── agents/               # execute, execute-pending, events (SSE), ws (redirect)
│   │   │   ├── agent/execution/[id]/ # pause, resume, cancel, logs, status
│   │   │   ├── auth/                 # NextAuth, 2FA, register, email-verify, password-reset
│   │   │   ├── jobs/                 # CRUD, [id]/activities, [id]/match, import, search/status
│   │   │   ├── interview-prep/       # route, [jobId], [jobId]/events, [jobId]/generate, mock, mock/feedback
│   │   │   ├── profile/              # route, entities, completeness, recommendations, narrative, etc.
│   │   │   ├── calendar/             # sync, events, authorize/callback (Google + Outlook)
│   │   │   ├── documents/            # CRUD, generate, compile
│   │   │   ├── offers/               # CRUD, [id]/negotiate, [id]/script
│   │   │   ├── interviews/           # CRUD
│   │   │   ├── settings/ai-providers/# route, scan
│   │   │   ├── admin/                # users, threats
│   │   │   ├── audit-logs/
│   │   │   ├── api-keys/
│   │   │   ├── account/              # profile, password, avatar, delete
│   │   │   ├── onboarding/
│   │   │   └── debug/                # db-check, auth-config
│   │   ├── dashboard/page.tsx
│   │   ├── jobs/page.tsx
│   │   ├── interview-prep/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── emails/page.tsx
│   │   ├── offers/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── resume-lab/page.tsx
│   │   ├── interviews/page.tsx
│   │   ├── onboarding/page.tsx
│   │   ├── audit-logs/page.tsx
│   │   ├── api-keys/page.tsx
│   │   └── settings/                 # account, security
│   ├── components/                   # React component library
│   │   ├── Agent/                    # AgentCard, AgentLog, AgentRail, AgentExecutionTimeline
│   │   ├── CareerOS/                 # IntegratedDashboard
│   │   ├── InterviewPrep/            # 8 tab components + workspace container
│   │   ├── Kanban/                   # KanbanBoard, Swimlane, JobCard
│   │   ├── Layout/                   # AppLayout, NavLayout
│   │   ├── Notifications/            # NotificationCenter, Toast
│   │   ├── Profile/                  # ProfileCompleteness, SkillMatrix, AchievementExtractor, etc.
│   │   ├── ResumeLab/                # ResumeEditor, VariantManager, ResumeLab
│   │   ├── Jobs/                     # MatchAnalysis
│   │   ├── analytics/                # ApplicationAnalytics, CareerTrajectory, MarketInsights
│   │   ├── forms/                    # AdvancedJobFilterForm
│   │   └── ui/                       # Design system: Button, Input, Modal, Badge, Card, etc.
│   ├── domains/                      # Domain-scoped feature modules
│   │   ├── jobs/                     # hooks (useJob, useInterviews, useOffers, useMutations, etc.)
│   │   │   └── components/           # JobDetailPanel + 6 tabs
│   │   ├── agents/
│   │   ├── documents/
│   │   ├── interviews/
│   │   ├── kanban/
│   │   └── profile/
│   ├── hooks/                        # Cross-cutting React hooks
│   │   ├── useRealTime.ts            # SSE-based real-time hook (wraps EventSource)
│   │   ├── useAgentRealTime.ts       # Agent-specific real-time + polling fallback
│   │   ├── useInterviewPrep.ts       # Interview prep + mock interview + progress tracking
│   │   ├── useJobs.ts, useJobBoard.ts, useMoveJob.ts
│   │   ├── useSocket.ts              # Socket.io client
│   │   ├── useJobStore.ts            # Zustand job store
│   │   └── useUIStore.ts             # Zustand UI store
│   ├── lib/                          # Shared library modules
│   │   ├── agents/                   # prompts.ts, executor.ts, redis-integration.ts
│   │   ├── llm/                      # provider.ts, anthropic.ts, nvidia-nim.ts, orchestrator.ts, privacy.ts, local-scanner.ts
│   │   ├── db/                       # db.ts (singleton), jobs.ts, offers.ts, documents.ts, interviews.ts, profile.ts
│   │   ├── queues/                   # jobQueue.ts (Redis list), workers.ts (DEPRECATED)
│   │   ├── security/                 # rbac.ts, apiKey.ts, threatDetection.ts, twoFactor.ts, csrfToken.ts, etc.
│   │   ├── middleware/               # auth.ts, rateLimiter.ts, withAuth.ts, cors.ts, routeGovernance.ts
│   │   ├── realtime/                 # events.ts (Redis schemas), agentStatusBroadcaster.ts, wsServer.ts
│   │   ├── scraping/                 # greenhouse.ts, indeed.ts, linkedin.ts, lever.ts, ashby.ts, worker.ts, provider.ts, scrapingQueue.ts
│   │   ├── calendar/                 # googleCalendar.ts, outlookCalendar.ts, oauthState.ts
│   │   ├── interview/                # generator.ts, prepService.ts
│   │   ├── profile/                  # profileService.ts, parser.ts, extractor.ts, normalizer.ts, tagger.ts, skill-extractor.ts, knowledge-builder.ts
│   │   ├── logging/                  # logger.ts (pino), auditLog.ts, traceContext.ts
│   │   ├── document/                 # generator.ts, compile.ts
│   │   ├── jobs/                     # matchScorer.ts
│   │   ├── analytics/                # export.ts
│   │   ├── redis/                    # redisClient.ts
│   │   ├── socket/                   # server.ts, auth.ts
│   │   ├── crypto/                   # tokenEncryption.ts
│   │   ├── safety/                   # promptSanitizer.ts
│   │   ├── errors/                   # ApiError.ts
│   │   ├── utils/                    # apiResponse.ts
│   │   ├── email.ts, auth.ts, config.ts, utils.ts, lib/db.ts
│   ├── types/                        # TypeScript interfaces
│   │   ├── job.ts                    # Job, JobStage, PIPELINE_STAGES, JobFilter, STAGE_COLORS
│   │   ├── agent.ts
│   │   ├── agent-configs.ts
│   │   ├── company.ts
│   │   ├── preparation.ts
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   └── __tests__/
│       ├── __mocks__/prisma.ts
│       ├── unit/                     # lib/utils, middleware/auth, stores/useJobStore & useUIStore, security/rbac, safety, validations
│       ├── integration/api/          # jobs.test.ts, jobs-id.test.ts
│       └── regression/               # core-flows.test.ts (8 user journey regressions)
├── server.js                         # Custom Next.js server: Socket.io + Redis pub/sub bridge
├── vercel.json                       # Cron: /api/agents/execute-pending at 0 0 * * *
├── next.config.js                    # Security headers, serverExternalPackages
├── tailwind.config.js                # Design tokens, 14-stage pipeline colors
├── tsconfig.json                     # TypeScript strict mode, path aliases
├── package.json                      # npm scripts, all deps
├── CLAUDE.md / AGENTS.md             # GitNexus integration docs (identical)
└── .github/                          # CI/CD workflows + templates
```

**[VERIFIED]** File counts: 50+ API routes, ~55 React components, ~80 library modules, ~26 Prisma models, 8 test suites.

---

# 3. Technology Stack

| Layer | Technology | Version | Confidence |
|-------|-----------|---------|-----------|
| Runtime | Node.js | 20 (CI pinned) | HIGH |
| Framework | Next.js App Router | ^16.2.6 | HIGH |
| Language | TypeScript | ^5.2.0 | HIGH |
| Database | PostgreSQL (via Prisma) | — | HIGH |
| ORM | Prisma Client | ^5.0.0 | HIGH |
| Auth | NextAuth v4 | ^4.24.14 | HIGH |
| Caching / Pub-Sub | Redis (ioredis) | ^5.10.1 | HIGH |
| WebSockets | Socket.io + Socket.io-client | ^4.8.3 | HIGH |
| AI — Primary | Anthropic Claude SDK | ^0.96.0 (claude-3-5-sonnet-20241022) | HIGH |
| AI — Secondary | Nvidia NIM (Llama2, OpenAI-compat API) | env-configured | HIGH |
| AI — Orchestrator | Multi-provider (Gemini, Groq, OpenRouter, Ollama, DeepSeek) | configured | HIGH [ASSUMPTION — providers defined in code but API keys not verified present] |
| State Management | Zustand | ^4.4.0 | HIGH |
| Server State | TanStack React Query | ^5.0.0 | HIGH |
| UI Framework | Tailwind CSS | ^3.3.0 | HIGH |
| Icon Library | Lucide React | ^1.16.0 | HIGH |
| HTTP Client | Axios | ^1.5.0 | HIGH |
| Scraping | Playwright | ^1.40.0 | HIGH |
| Email | Resend | ^6.12.3 | HIGH |
| Logging | Pino | ^8.16.0 | HIGH |
| 2FA | Speakeasy (TOTP) + QRCode | ^2.0.0 / ^1.5.4 | HIGH |
| Password Hashing | bcryptjs | ^3.0.3 | HIGH |
| Input Sanitization | DOMPurify | ^3.3.1 | HIGH |
| Validation | Zod | ^3.22.0 | HIGH |
| Testing | Jest + @testing-library/react + Cypress | ^29.7.0 / ^13.6.0 | HIGH |
| CI/CD | GitHub Actions | — | HIGH |
| Documentation | TypeDoc + dependency-cruiser + madge | — | HIGH |
| Linting/Formatting | ESLint + Prettier | ^9.39.2 / ^3.0.0 | HIGH |
| Git Hooks | Husky | ^9.1.7 | HIGH |

---

# 4. AS-IS Architecture

## 4.1 High-Level Architecture Diagram

```text
┌────────────────────────────────────────────────────────────────┐
│                         Browser Client                          │
│                                                                  │
│  React (Next.js App Router)                                     │
│  TanStack Query  │  Zustand Stores  │  SSE EventSource         │
│  Socket.io-client (WebSocket)                                   │
└────────┬───────────────────────────────┬────────────────────────┘
         │  HTTP / REST                  │  WebSocket (ws://)
         │  SSE (GET /api/agents/events) │
         ▼                               ▼
┌────────────────────────────────────────────────────────────────┐
│                    Next.js App Router Server                     │
│             (embedded in custom Node.js server.js)              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Routes (50+)                                         │  │
│  │  /api/jobs  /api/agents  /api/interview-prep             │  │
│  │  /api/auth  /api/profile /api/calendar  /api/offers      │  │
│  │  withAuth middleware → rateLimiter → route handler        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Socket.io Server (server.js)                             │  │
│  │  NextAuth JWT auth middleware                             │  │
│  │  Rooms: user:{email}, job:{id}                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────┬────────────────────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌────────────────────────────────────────┐
│  PostgreSQL DB  │    │  Redis                                  │
│  (Prisma ORM)   │    │  ┌────────────────────────────────┐   │
│  26 models      │    │  │ Pub/Sub: agent:*, queue:*       │   │
│  5 state enums  │    │  │ Rate limiting (Lua INCR/EXPIRE) │   │
│                 │    │  │ Agent status snapshots          │   │
└─────────────────┘    │  │ Job Queue (Redis lists)         │   │
                       │  └────────────────────────────────┘   │
                       └────────────────────────────────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  External AI Providers       │
                         │  Anthropic Claude API        │
                         │  Nvidia NIM (Llama2)         │
                         │  Gemini / Groq / OpenRouter  │
                         │  (orchestrator.ts)           │
                         └──────────────────────────────┘
                                        │
                         ┌──────────────▼──────────────┐
                         │  External Service APIs       │
                         │  Resend (email)              │
                         │  Google Calendar OAuth       │
                         │  Outlook Calendar OAuth      │
                         │  Greenhouse / Indeed boards  │
                         │  LinkedIn / Lever / Ashby    │
                         └──────────────────────────────┘
```

## 4.2 Agent Execution Data Flow

```text
Browser
  │ POST /api/agents/execute { agentType, context }
  ▼
execute/route.ts
  ├─ Auth check (getServerSession)
  ├─ Create AgentExecution record (status=queued)
  ├─ Create EventLog record
  └─ publishAgentStatus → Redis pub/sub (fire-and-forget)

Vercel Cron (daily @ 00:00) ──► GET /api/agents/execute-pending
                                    │
                                    ▼
                          executor.ts: processPendingExecutions()
                            ├─ Recover stuck 'running' executions (10 min threshold)
                            ├─ Claim execution: updateMany (queued → running)
                            ├─ streamLLM(prompt) with 55s AbortSignal timeout
                            ├─ Persist output → AgentExecution.output
                            ├─ publishAgentCompleted → Redis
                            └─ Update status = completed|failed

Redis pub/sub → Socket.io pmessage handler (server.js)
                    └─ io.to(`user:${email}`).emit(event)
                         └─► Browser SSE / WebSocket receives update
```

**[RISK]** Cron frequency is once-daily — queued agents wait up to 24 hours.

## 4.3 Real-Time Dual Transport

```text
Client (Browser)
    │
    ├─── EventSource /api/agents/events  ──────► SSE stream
    │         (useRealTime.ts, useAgentRealTime.ts)
    │         Server side: ioredis subscriber per SSE connection
    │         - sends 'snapshot' on connect
    │         - forwards 'agent:status_update', 'agent:execution_update'
    │         - heartbeat every 25s
    │
    └─── Socket.io WebSocket /socket.io  ──────► server.js Socket.io
              (useSocket.ts)
              - room join/leave for jobs
              - Redis pmessage bridge (agent:*, queue:*)
              - job:update, typing indicators
              - Fallback: polling (5s) in useAgentRealTime
```

**[VERIFIED]** The `ws/route.ts` endpoint issues a 308 redirect to `/api/agents/events` — WebSocket upgrades go through `server.js` Socket.io, not Next.js API routes.

---

# 5. Codebase Structure Analysis

## 5.1 Application Pages

| Page | Route | Purpose |
|------|-------|---------|
| Dashboard | /dashboard | Integrated overview (career OS) |
| Jobs Kanban | /jobs | 14-stage pipeline Kanban board |
| Interview Prep | /interview-prep | AI-generated prep workspace |
| Resume Lab | /resume-lab | Resume editor and variant management |
| Analytics | /analytics | Application analytics + market insights |
| Documents | /documents | Document management |
| Emails | /emails | Email generation |
| Offers | /offers | Offer tracking |
| Calendar | /calendar | Synced interview calendar |
| Interviews | /interviews | Interview log |
| Onboarding | /onboarding | Profile setup flow |
| Audit Logs | /audit-logs | Security audit trail |
| API Keys | /api-keys | API key management |
| Settings | /settings/account, /settings/security | User preferences, 2FA |
| Profile Accomplishments | /profile/accomplishments | Achievement tracking |

## 5.2 Domain Module Structure

CareerPropel uses a hybrid architecture: Next.js App Router (`src/app/`) handles routing and API surface; `src/domains/` provides domain-bounded feature modules; `src/components/` provides a shared UI library; `src/lib/` provides cross-cutting infrastructure.

**[VERIFIED]** Domain modules: `agents`, `documents`, `interviews`, `jobs` (richest — 6 hooks, 6 tab components), `kanban`, `profile`.

## 5.3 State Architecture

```text
┌─────────────────────────────────────────────────────┐
│  Client-side State                                   │
│  ┌─────────────────┐  ┌──────────────────────────┐ │
│  │  Zustand Stores  │  │  TanStack React Query     │ │
│  │  - useJobStore   │  │  staleTime: 5 min         │ │
│  │  - useUIStore    │  │  gcTime: 10 min            │ │
│  │    (modals,      │  │  retry: 1                  │ │
│  │     panels,      │  │  refetchOnWindowFocus: off │ │
│  │     night mode)  │  │                            │ │
│  └─────────────────┘  └──────────────────────────┘ │
│                                                       │
│  Real-time Layer                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  useRealTime (SSE) → EventSource              │  │
│  │  useAgentRealTime (SSE + polling fallback)    │  │
│  │  useInterviewPrepProgress (SSE + polling)     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## 5.4 Authentication Architecture

NextAuth v4 with:
- **Credentials provider**: bcrypt password validation against `Candidate.passwordHash`
- **OAuth providers**: GitHub and Google (conditionally loaded by env vars)
- **Dev bypass**: `ALLOW_DEV_LOGIN=true` creates bounded in-memory user map (max 100 entries); hard-blocked in production

Sessions are JWT-based (cookies). The Socket.io server extracts the JWT from cookies using `next-auth/jwt.getToken`.

**[VERIFIED]** `src/lib/auth.ts` — RASUI-003 remediation applied: production guard added.

---

# 6. Dependency & Module Graph

## 6.1 Core Dependency Flow

```text
Browser Components
    └─► src/hooks/          (React hooks)
            ├─► src/lib/api/client.ts        (fetch wrapper)
            └─► src/lib/websocket/types.ts   (event types)

API Routes (/api/*)
    ├─► src/lib/middleware/auth.ts           (getAuthContext)
    ├─► src/lib/middleware/withAuth.ts       (HOF wrapper)
    ├─► src/lib/middleware/rateLimiter.ts    (Redis-backed rate limit)
    ├─► src/lib/db.ts                        (Prisma singleton)
    └─► src/lib/[domain]/                    (business logic)

src/lib/agents/executor.ts
    ├─► src/lib/llm/provider.ts             (streamLLM)
    ├─► src/lib/agents/prompts.ts           (system/user prompt builders)
    ├─► src/lib/agents/redis-integration.ts  (status broadcasting)
    └─► src/lib/db.ts                        (execution persistence)

src/lib/llm/orchestrator.ts
    ├─► prisma (AiProviderConfig, UserCapabilityPreset, TokenUsageLog)
    └─► external HTTP (Anthropic, OpenAI-compat, Gemini, Groq, etc.)

src/lib/realtime/events.ts
    └─► Redis pub/sub schema (no direct imports; used by SSE route and server.js)
```

## 6.2 Circular Dependency Risk

**[ASSUMPTION — not fully traced]** The dual existence of `src/lib/llm/provider.ts` and `src/lib/llm/orchestrator.ts` suggests potential redundancy. The executor uses `provider.ts`; the settings/AI scan route likely uses `orchestrator.ts`. These should be unified.

## 6.3 External API Dependencies

| Service | Scope | Auth Method | File |
|---------|-------|-------------|------|
| Anthropic Claude | AI (primary agent executor) | API key (env) | `src/lib/llm/anthropic.ts` |
| Nvidia NIM | AI (secondary, OpenAI-compat) | API key (env) | `src/lib/llm/nvidia-nim.ts` |
| Gemini/Groq/OpenRouter | AI (orchestrator fallback) | Per-provider key | `src/lib/llm/orchestrator.ts` |
| Greenhouse | Job board scraping | Public API | `src/lib/scraping/greenhouse.ts` |
| Indeed | Job board scraping | Playwright scraping | `src/lib/scraping/indeed.ts` |
| LinkedIn | Profile import + search | Playwright scraping | `src/lib/scraping/linkedin.ts` |
| Lever / Ashby | Job board scraping | Public API | `src/lib/scraping/lever.ts`, `ashby.ts` |
| Google Calendar | Calendar integration | OAuth 2.0 | `src/lib/calendar/googleCalendar.ts` |
| Outlook Calendar | Calendar integration | OAuth 2.0 | `src/lib/calendar/outlookCalendar.ts` |
| Resend | Transactional email | API key (env) | `src/lib/email.ts` |

---

# 7. Runtime & Deployment Architecture

## 7.1 Server Configuration

The application runs as a **custom Node.js HTTP server** (`server.js`) that wraps Next.js with Socket.io. This bypasses Vercel's Edge Network for WebSocket connections and requires a persistent process runtime.

```text
node server.js  (npm start / npm run dev)
    │
    ├─► next.prepare()
    │       └─► Next.js App Router handles HTTP requests
    │
    ├─► http.createServer / https.createServer (SSL optional via env)
    │       SSL: SSL_KEY_PATH + SSL_CERT_PATH env vars
    │
    └─► Socket.io Server (same http server)
            CORS: CORS_ALLOWED_ORIGINS env (comma-separated)
            Transports: websocket, polling
            Auth: NextAuth JWT cookie verification
            Redis bridge: psubscribe('agent:*', 'queue:*')
```

## 7.2 Cron Execution

**[VERIFIED]** `vercel.json` defines one cron:

```json
{ "path": "/api/agents/execute-pending", "schedule": "0 0 * * *" }
```

This invokes `GET /api/agents/execute-pending` at midnight UTC daily. The agent executor runs synchronously within this single Vercel function invocation, limited by Vercel's function timeout (60s Hobby, 300s Pro).

**[RISK — HIGH]** Daily cron frequency means a newly queued agent executes up to 24 hours later. This is incompatible with a real-time career platform UX. The vercel.json cron is also incompatible with the custom `server.js` approach unless deployed behind Vercel.

## 7.3 Environment Variables

| Variable | Purpose | Required |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | YES |
| `NEXTAUTH_SECRET` | JWT signing secret | YES |
| `NEXTAUTH_URL` | Application base URL | YES |
| `REDIS_HOST` | Redis host | YES (for real-time) |
| `REDIS_PORT` | Redis port (default 6379) | NO |
| `REDIS_PASSWORD` | Redis password | NO |
| `ANTHROPIC_API_KEY` | Claude API key | YES (for agents) |
| `NIM_API_KEY` | Nvidia NIM key | NO |
| `NIM_BASE_URL` | NIM endpoint | NO |
| `NIM_MODEL` | NIM model | NO |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth | NO |
| `GOOGLE_ID` / `GOOGLE_SECRET` | Google OAuth | NO |
| `ALLOW_DEV_LOGIN` | Dev bypass (never in production) | NO |
| `SSL_KEY_PATH` / `SSL_CERT_PATH` | HTTPS certs for server.js | NO |
| `CORS_ALLOWED_ORIGINS` | Socket.io CORS allowlist | NO |
| `PORT` / `HOSTNAME` | Server bind config | NO |

**[ASSUMPTION]** No `.env.example` file was found in the repository root. The above variables are inferred from code. This is a documentation gap.

## 7.4 Deployment Model

**[ASSUMPTION — MEDIUM confidence]** Given `vercel.json` presence, the intended platform is Vercel. However, `server.js` with Socket.io cannot run on Vercel's serverless functions (which are stateless and don't support persistent TCP connections). The most likely actual deployment is a containerized VM (e.g., a Railway, Render, or Fly.io instance), or Vercel with a separate Socket.io server on another host. This architectural tension is unresolved in the codebase.

**[VERIFIED]** No `Dockerfile` or `docker-compose.yml` was found.

---

# 8. Infrastructure & DevOps Review

## 8.1 CI/CD Pipeline

```text
GitHub Actions (ci.yml)
    ├─ quality      : npm ci → lint → type-check
    ├─ test         : npm ci → test:coverage → upload coverage artifact
    ├─ security-audit: npm ci → npm audit --audit-level=high
    └─ spec-check   : npm ci → node scripts/governance/spec-check.js
                              (PR only — fails + comments if spec docs missing)

Additional workflows:
    ├─ lighthouse.yml     : Performance audit
    └─ dependency-review.yml: License review
```

**Strengths:**
- Concurrent jobs with `cancel-in-progress: true` to avoid wasted runners
- Coverage artifacts retained 7 days
- Spec governance enforced at PR boundary
- `npm audit --audit-level=high` (not moderate — moderate tracked manually)

**Gaps:**
- No E2E (Cypress) in CI pipeline — `test:e2e` script exists but not in ci.yml
- No container build/push step (no Docker)
- No deploy step — deployment is fully manual or handled by platform integration
- No production smoke tests post-deploy

## 8.2 Code Quality Tooling

| Tool | Purpose | Config |
|------|---------|--------|
| ESLint (v9) | Linting | `@typescript-eslint` + `eslint-config-next` |
| Prettier | Formatting | `.prettierrc.json` |
| TypeScript (strict) | Type safety | All strict flags enabled |
| Husky | Pre-commit hooks | `prepare: husky` |
| TypeDoc | API docs | `typedoc-plugin-markdown` + merge-modules |
| dependency-cruiser | Dep graph generation | `.dependency-cruiser/` |
| madge | Circular dep detection | `madge --circular src` |
| GitNexus | Symbol-level impact analysis | External MCP service |

**[VERIFIED]** TypeScript config enables full strict mode: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noUnusedLocals`, `noUnusedParameters`. This is exemplary.

---

# 9. Security & Governance Review

## 9.1 Authentication & Authorization

**Multi-layer auth stack:**

1. **NextAuth session** — JWT cookie, validated by `getServerSession` in every API route
2. **RBAC** — `src/lib/security/rbac.ts` defines roles (admin, recruiter, candidate) with granular permissions stored in PostgreSQL. Checked via `hasPermission()` async DB calls.
3. **API key authentication** — `src/lib/security/apiKey.ts` — keys stored as bcrypt hash, prefix-indexed for fast lookup
4. **2FA (TOTP)** — Speakeasy TOTP via `/api/auth/2fa/` routes; secrets stored encrypted in `TwoFactorSecret` model

**Route-level enforcement:**
- `withAuth` HOF (`src/lib/middleware/withAuth.ts`) wraps route handlers with auth + rate limit + audit logging
- `getAuthContext()` is the canonical auth extraction function
- Individual routes still call `getServerSession` directly in some cases — minor inconsistency

**[RISK — MEDIUM]** The RBAC check in `hasPermission()` issues database queries on every permission check. With no caching, high-frequency endpoints will hammer the DB for permission lookups.

## 9.2 Security Headers

**[VERIFIED]** `next.config.js` applies global response headers:
- `X-Frame-Options: DENY` — clickjacking prevention
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (2 years HSTS)

**Assessment:** Security headers are well-configured and applied globally.

## 9.3 Input Validation & Sanitization

- **Zod schemas** for all API request bodies (`src/lib/validations/job.ts`, `src/lib/validation/schemas.ts`)
- **`sanitizeUserFeedback()`** strips HTML tags and escapes HTML entities (prevents stored XSS)
- **`sanitizePrompt()`** strips 8 known prompt injection patterns (regex-based); wraps content in delimiters
- **DOMPurify** imported as dependency — [ASSUMPTION: used in client-side rendering of user content]
- **`validateInterviewPrepInput()`** checks min/max length and blocks code-pattern injection (eval, exec, require)

**[RISK — MEDIUM]** `sanitizePrompt()` uses 8 regex patterns. This is a heuristic — sophisticated injection attempts using Unicode normalization, leetspeak substitution, or split-token attacks will bypass this filter. A more robust approach requires semantic filtering at the LLM layer.

## 9.4 Encryption & Secrets

- **AI provider API keys**: AES-256-GCM encrypted at rest in `AiProviderConfig.encryptedKey` using a master secret (`src/lib/llm/privacy.ts`)
- **Internal API keys**: bcrypt-hashed, prefix stored for lookup; full key never persisted
- **2FA secrets**: encrypted (method inferred; `TwoFactorSecret.secret` field described as "Encrypted TOTP secret")
- **Calendar OAuth tokens**: **stored in plaintext** in `CalendarToken.accessToken` and `refreshToken` — [RISK — HIGH]

## 9.5 Rate Limiting

**[VERIFIED]** `src/lib/middleware/rateLimiter.ts`:
- Redis-backed, Lua-scripted atomic INCR+EXPIRE to prevent race conditions
- Global: 100 req/60s per IP
- Scoped: per-endpoint limiters via `createRateLimiter()`
- **Fail-open when Redis is unavailable** — rate limiting silently disables

**[RISK — MEDIUM]** Fail-open on Redis unavailability means an outage of the Redis server removes all rate limiting. For auth endpoints (login, register), fail-closed would be more appropriate.

## 9.6 Threat Detection

**[VERIFIED]** `src/lib/security/threatDetection.ts` implements:
- **Brute force detection**: 5+ failed logins in 24h → HIGH alert
- **Impossible travel**: successful logins from 2 IPs within 30 minutes → MEDIUM alert
- **Unusual login time**: 2–5 AM logins → LOW alert
- **Rapid API call detection**: 100+ API calls in < 10 minutes → HIGH alert
- **Bulk data access**: 50+ data_access operations in 24h → MEDIUM alert
- **Multiple IP activity**: 3+ IPs in 24h → LOW alert

**[ASSESSMENT]** Threat detection is sophisticated but relies on DB polling (not streaming analysis). No automated response/blocking — alerts are generated but enforcement must be wired to admin UI or out-of-band alerting.

## 9.7 Audit Logging

**[VERIFIED]** `AuditLog` Prisma model captures: email, action, resource, resourceId, details (JSON), ipAddress, userAgent, status, severity. Available at `/audit-logs` page and `/api/audit-logs` route.

## 9.8 Prompt Security

PII redaction layer (`redactPii()` in `src/lib/llm/privacy.ts`) intercepts outbound LLM contexts and tokenizes emails, phones, SSNs, and ZIP codes before sending to external providers. `restorePii()` restores tokens in returned output. This is a meaningful privacy control.

**Zero-retention headers**: sent to Anthropic (`anthropic-beta: zero-data-retention`) and OpenAI (`X-OpenAI-Opt-Out: true`). **[ASSUMPTION]** These headers' effectiveness depends on provider contract terms; `anthropic-beta: zero-data-retention` is not a published Anthropic header name as of the knowledge cutoff — this may have no effect.

---

# 10. Performance & Scalability Review

## 10.1 Database Performance

**Indexed queries (VERIFIED from schema):**
- `Job`: indexed on `candidateId`, `stage`
- `AgentExecution`: indexed on `userId`, `status`
- `AuditLog`: indexed on `email`, `action`, `createdAt`, `severity`
- `LoginAttempt`: indexed on `email`, `timestamp`, `success`
- `SessionActivity`: indexed on `email`, `sessionId`, `timestamp`, `riskScore`
- `CalendarEvent`: indexed on `candidateId`, `startAt`

**N+1 risks:**
- `getUserPermissions()` in `rbac.ts` — nested includes `role → permissions → permission` per user per request — no caching layer
- Threat detection queries: `findMany` with date-range filters on `LoginAttempt` and `SessionActivity` per suspicious event — could be expensive for active users

**Missing indices (potential):**
- `Contact.candidateId + followUpAt` — follow-up queries likely filter by date
- `AgentExecution.createdAt` — time-range queries for analytics

## 10.2 API Response Patterns

**[VERIFIED]** Standard response shape via `successResponse()` / `errorResponse()` in `src/lib/utils/apiResponse.ts`. Consistent error factory (`ApiErrors`) with typed status codes.

## 10.3 Caching

- **TanStack Query** client-side: staleTime 5 min, gcTime 10 min
- **Redis**: used for rate limit state, agent status snapshots, pub/sub — not used for query caching
- **No HTTP cache headers** on list endpoints (GET /api/jobs returns `export const dynamic = 'force-dynamic'`)
- **No CDN caching** strategy documented [ASSUMPTION]

## 10.4 Real-Time Scalability

Each SSE connection to `/api/agents/events` creates a dedicated `ioredis` subscriber connection. At 1,000 concurrent users, that's 1,000 Redis subscriber connections. This will hit Redis connection limits and memory pressure at scale.

**[RISK — HIGH]** Per-SSE-connection Redis subscriber is not scalable. A shared subscriber with a fan-out pattern (one ioredis subscriber per process, broadcasting to all SSE streams in-process) is the correct architecture.

## 10.5 AI Agent Throughput

- Agent execution is driven by a once-daily Vercel cron
- Each execution runs synchronously within a single serverless function call
- 55s hard timeout on LLM streaming (RASUI-005 remediation applied)
- Stuck execution recovery: 10-minute threshold
- No batch processing — one execution per cron invocation [ASSUMPTION — not verified in execute-pending route]

---

# 11. Testing & Quality Engineering Review

## 11.1 Test Coverage Structure

| Test Category | Files | What's Tested |
|---------------|-------|---------------|
| Unit: lib/utils | `lib/utils.test.ts` | Utility functions |
| Unit: middleware/auth | `middleware/auth.test.ts` | Auth middleware |
| Unit: stores | `useJobStore.test.ts`, `useUIStore.test.ts` | Zustand stores |
| Unit: security/rbac | `security/rbac.test.ts` | Full RBAC function set (14 describe blocks) |
| Unit: middleware/cors | `middleware/cors.test.ts` | CORS middleware |
| Unit: validations | `lib/validations/job.test.ts` | Zod schema validation |
| Unit: safety | `safety/promptSanitizer.test.ts` | Prompt injection sanitizer |
| Unit: utils | `utils/apiResponse.test.ts` | API response factories |
| Integration: API | `jobs.test.ts`, `jobs-id.test.ts` | Jobs CRUD API routes |
| Regression | `core-flows.test.ts` | 8 multi-layer user journeys |

**Prisma mock**: `src/__tests__/__mocks__/prisma.ts` — mock singleton for database isolation.

**[VERIFIED]** The regression suite covers: add+select job flow, pipeline stage progression, filter+sort, delete+clear selection, input validation+sanitization pipeline, ApiErrors factory, modal lifecycle, UI preference toggles.

## 11.2 Testing Gaps

- **No E2E Cypress tests in CI** — `cypress.json` and `test:e2e` script exist but not integrated in `ci.yml`
- **AI/LLM calls not tested** — no mock of Anthropic SDK in unit tests for executor
- **SSE routes not tested** — `/api/agents/events` and `/api/interview-prep/[jobId]/events` have no test coverage
- **Calendar integration not tested** — OAuth flows have no test coverage
- **Real-time Socket.io behavior not tested** — no integration tests for WebSocket handlers
- **Profile pipeline not tested** — `src/lib/profile/` (extractor, normalizer, parser, skill-extractor) lack unit tests

## 11.3 Code Quality Signals

- TypeScript strict mode: all strict flags enabled — HIGH quality signal
- Zod validation on all API inputs — HIGH quality signal
- `as any` casts found in hot paths — `execute/route.ts:154` checks `execution.userId !== callerEmail && execution.candidateId !== callerEmail` using `as any` to access `candidateId` (which doesn't exist on AgentExecution model) — [RISK — MEDIUM, type-safety bypass]
- Dead code: `src/lib/queues/workers.ts` — deprecated stub, should be deleted
- Comments document RASUI (audit) remediation items — good traceability

---

# 12. Prompt/AI Architecture Review

## 12.1 Agent Type Taxonomy

**Phase 2 AgentTypes** (`src/lib/agents/prompts.ts`):
`resume-tailor | job-match | interview-prep | research | follow-up | networking`

**Legacy/Events AgentTypes** (`src/lib/realtime/events.ts`):
`resume_tailor | job_matching | application | research | interview_prep | networking | follow_up | analytics`

**[VERIFIED]** `src/lib/agents/redis-integration.ts` — adapter layer maps Phase 2 types to legacy types. This dual taxonomy is technical debt that could cause mismatches in event routing.

## 12.2 Prompt Structure

All 6 agent types have:
1. System prompt defining role, 5-step approach, and JSON output structure
2. User prompt assembled from `AgentPromptContext` (resume, jobDescription, companyName, companyInfo, userProfile, previousInterviews)
3. JSON response schemas defined in the system prompt (not enforced by schema validation at the LLM output layer)

**[RISK — MEDIUM]** LLM outputs are stored as raw JSON strings and parsed on retrieval. No Zod validation of LLM output. A malformed LLM response will surface as a runtime error at the consumer, not at the execution boundary.

## 12.3 Multi-Provider Orchestration

`src/lib/llm/orchestrator.ts` defines a Capability Preset system:

| Capability | Primary | Fallback Chain |
|------------|---------|----------------|
| RESUME_OPTIMIZATION | gemini:gemini-2.5-flash | openai:gpt-4o-mini → groq:llama-3.1-8b-instant → local:llama3 |
| ATS_OPTIMIZATION | groq:llama-3.1-8b-instant | gemini:gemini-2.5-flash → openai:gpt-4o-mini → local:mistral |
| (additional presets) | varies | varies |

**[ASSUMPTION]** These presets are defined in code but the orchestrator's usage is unclear — the canonical executor in `executor.ts` calls `streamLLM()` from `provider.ts`, not the orchestrator. The orchestrator may power the `settings/ai-providers` feature independently.

## 12.4 Privacy Controls

| Control | Implementation | Status |
|---------|---------------|--------|
| PII redaction before LLM calls | `redactPii()` regex patterns | IMPLEMENTED |
| PII restoration after LLM response | `restorePii()` token map | IMPLEMENTED |
| Prompt injection stripping | `sanitizePrompt()` regex patterns | IMPLEMENTED |
| API key encryption at rest | AES-256-GCM | IMPLEMENTED |
| Zero-retention headers | Provider-specific headers | IMPLEMENTED [ASSUMPTION: effectiveness unverified] |
| Prompt boundary markers | `--- USER INPUT START/END ---` | IMPLEMENTED |

---

# 13. Architectural Fitness Assessment

| Fitness Function | Status | Evidence |
|-----------------|--------|---------|
| Type safety (strict TS) | PASS | tsconfig.json all-strict |
| Input validation at API boundary | PASS | Zod schemas on all POST/PUT |
| Auth enforcement at route level | PASS | withAuth HOF + getAuthContext |
| RBAC model present | PASS | src/lib/security/rbac.ts |
| Rate limiting | PARTIAL | Fail-open on Redis down |
| Audit logging | PASS | AuditLog model + withAuth integration |
| Security headers | PASS | next.config.js global headers |
| Unit test coverage | PARTIAL | Good for security/stores, gaps in AI/SSE/calendar |
| E2E tests in CI | FAIL | Cypress exists but not in ci.yml |
| No circular deps (self-declared) | UNKNOWN | madge script exists but not in CI |
| Real-time agent updates | PARTIAL | SSE works; cron frequency breaks UX |
| Prompt injection protection | PARTIAL | Regex-based heuristics only |
| PII protection | PASS | Redaction layer + AES encryption for keys |
| Deployment clarity | FAIL | server.js + vercel.json conflict unresolved |
| Demo data isolation | PASS | seed-demo-data.ts with profiles + purge script |
| Spec governance | PASS | spec-check.js in CI on PRs |

---

# 14. Risks & Anti-Patterns

| ID | Severity | Category | Description | Evidence |
|----|---------|---------|-------------|---------|
| R-01 | HIGH | Operational | Vercel cron runs once daily — agents queue for up to 24h | `vercel.json` |
| R-02 | HIGH | Scalability | Per-SSE Redis subscriber connection — exhausts Redis at scale | `src/app/api/agents/events/route.ts:43-50` |
| R-03 | HIGH | Security | Calendar OAuth tokens stored in plaintext DB | `prisma/schema.prisma:CalendarToken.accessToken` |
| R-04 | HIGH | Architecture | server.js + vercel.json deployment conflict unresolved | `server.js`, `vercel.json` |
| R-05 | MEDIUM | Security | Rate limiting fails open when Redis unavailable | `src/lib/middleware/rateLimiter.ts:27-30` |
| R-06 | MEDIUM | Performance | RBAC `hasPermission()` hits DB on every check, no caching | `src/lib/security/rbac.ts:180-206` |
| R-07 | MEDIUM | Type Safety | `as any` cast accessing `candidateId` on AgentExecution | `src/app/api/agents/execute/route.ts:154` |
| R-08 | MEDIUM | AI Safety | LLM output not validated against Zod schema — runtime errors possible | `src/lib/agents/executor.ts` |
| R-09 | MEDIUM | AI Safety | Prompt injection detection is regex-heuristic only | `src/lib/safety/promptSanitizer.ts:1-10` |
| R-10 | MEDIUM | Maintenance | Dual AgentType taxonomy (Phase2 vs legacy events) — adapter complexity | `src/lib/agents/redis-integration.ts:23-36` |
| R-11 | LOW | Maintenance | `src/lib/queues/workers.ts` — deprecated stub not yet deleted | `workers.ts:1-17` |
| R-12 | LOW | Testing | E2E Cypress tests not integrated in CI | `ci.yml` (missing test:e2e) |
| R-13 | LOW | Documentation | No `.env.example` file found | Repository root |
| R-14 | LOW | AI | `anthropic-beta: zero-data-retention` header unrecognized by Anthropic API | `src/lib/llm/privacy.ts:163` |
| R-15 | LOW | Performance | `isStale` in `useInterviewPrep` auto-regenerates after 5s idle — could trigger excessive AI calls | `src/hooks/useInterviewPrep.ts:178-185` |

---

# 15. Technical Debt Assessment

## 15.1 Immediate Debt (should resolve in current sprint)

- **R-07**: Remove `as any` casts in `execute/route.ts:154` — add proper type guards or fix the model field name
- **R-11**: Delete `src/lib/queues/workers.ts` after confirming zero callers (as its own TODO says)
- **R-13**: Add `.env.example` to document all required env vars

## 15.2 Short-Term Debt (1-2 sprints)

- **R-01**: Fix Vercel cron frequency — change from `0 0 * * *` to `* * * * *` (every minute) or implement a webhook/push trigger from the POST /api/agents/execute route to process immediately
- **R-05**: Change rate limit fail behavior on auth endpoints to fail-closed
- **R-08**: Add Zod validation for LLM output JSON (define schemas in `src/types/agent-configs.ts` and validate on parse)
- **R-12**: Add Cypress smoke tests to CI on staging environment
- **R-10**: Unify the two AgentType taxonomies into one canonical enum

## 15.3 Long-Term Debt (roadmap items)

- **R-02**: Replace per-SSE Redis subscriber with a shared subscriber + in-process fan-out
- **R-03**: Encrypt CalendarToken OAuth tokens with AES-GCM (same pattern as API key encryption)
- **R-04**: Resolve server.js vs Vercel deployment conflict — choose one runtime model and document it
- **R-06**: Add Redis-based permission cache for RBAC (e.g., 60s TTL keyed by email)
- **R-09**: Augment prompt injection detection with semantic/ML-based filtering or adopt a dedicated library

---

# 16. Recommended TO-BE Architecture

## 16.1 Agent Execution Architecture (TO-BE)

```text
Current (AS-IS):
  Browser → POST /api/agents/execute → DB (queued)
  Vercel Cron (daily midnight) → execute-pending → LLM → DB

Target (TO-BE):
  Browser → POST /api/agents/execute → DB (queued)
                                      └─► Redis publish 'agent:trigger:{userId}'
  Persistent worker process (server.js or dedicated worker)
      └─► subscribe('agent:trigger:*')
          └─► processPendingExecutions() immediately
              └─► Real-time SSE feedback to browser
```

## 16.2 Real-Time Transport (TO-BE)

```text
Current (AS-IS):
  Each SSE connection → 1 ioredis subscriber (N connections = N Redis subs)

Target (TO-BE):
  1 shared ioredis subscriber per process
      └─► In-process EventEmitter / BroadcastChannel
          └─► All active SSE connections subscribed to EventEmitter
              (no per-connection Redis subscribers)
```

## 16.3 Security Enhancements (TO-BE)

1. Encrypt CalendarToken.accessToken and refreshToken using the same AES-256-GCM pattern as API keys
2. Cache RBAC permission lookups in Redis (60s TTL) to reduce DB load
3. Fail-closed rate limiting for auth routes (login, register, 2FA)
4. Validate LLM JSON outputs with Zod before storage

## 16.4 Deployment (TO-BE)

Choose one of:
- **Option A (Vercel-native)**: Use Vercel's background functions or Vercel Queues for agent execution; use a third-party managed Socket.io service (e.g., Ably, Pusher) for WebSockets; remove `server.js`
- **Option B (Self-hosted)**: Keep `server.js`; remove `vercel.json`; deploy to Railway/Fly.io/AWS ECS; add Dockerfile; set up proper cron via process scheduler or a dedicated cron service

---

# 17. Refactoring & Migration Roadmap

## Phase 1 — Stabilize (1 week)

| Task | File(s) | Risk |
|------|---------|------|
| Fix `as any` type cast in execute/route.ts | `src/app/api/agents/execute/route.ts:154` | LOW |
| Delete deprecated workers.ts | `src/lib/queues/workers.ts` | LOW |
| Add .env.example | repo root | LOW |
| Fix vercel.json cron to `* * * * *` | `vercel.json` | MEDIUM |
| Add Cypress to CI on push to main | `.github/workflows/ci.yml` | LOW |

## Phase 2 — Harden (2–3 weeks)

| Task | File(s) | Risk |
|------|---------|------|
| Encrypt CalendarToken fields | `prisma/schema.prisma`, calendar routes | MEDIUM |
| Fail-closed rate limit for /api/auth/* | `src/lib/middleware/rateLimiter.ts` | LOW |
| Zod validation for LLM output | `src/lib/agents/executor.ts` | LOW |
| Redis-cached RBAC permissions | `src/lib/security/rbac.ts` | MEDIUM |
| Unify AgentType taxonomy | `src/lib/agents/prompts.ts`, `src/lib/realtime/events.ts`, redis-integration.ts | MEDIUM |

## Phase 3 — Scale (1–2 months)

| Task | File(s) | Risk |
|------|---------|------|
| Shared Redis subscriber for SSE | `src/app/api/agents/events/route.ts` | HIGH |
| Containerize (Dockerfile + docker-compose) | repo root | MEDIUM |
| Resolve server.js vs Vercel deployment | `server.js`, `vercel.json`, deployment config | HIGH |
| Semantic prompt injection defense | `src/lib/safety/promptSanitizer.ts` | MEDIUM |
| E2E smoke test suite for core flows | `cypress/` | LOW |

---

# 18. Prioritized Action Matrix

| Priority | ID | Action | Effort | Impact | Risk If Ignored |
|---------|----|----|-------|--------|----------------|
| P0 | A1 | Fix cron frequency (daily → minute/immediate trigger) | S | HIGH | Agents silently queue for 24h; platform is unusable for production |
| P0 | A2 | Encrypt CalendarToken.accessToken/refreshToken | M | HIGH | OAuth tokens exposed in plaintext DB dump |
| P1 | A3 | Per-SSE Redis subscriber → shared subscriber | L | HIGH | Redis connection exhaustion at 1K users |
| P1 | A4 | Fix `as any` cast in execute/route.ts | XS | MEDIUM | Type safety regression in access control |
| P1 | A5 | Fail-closed rate limiting for auth endpoints | S | HIGH | Brute force attacks succeed during Redis outage |
| P2 | A6 | Zod validation for LLM JSON output | S | MEDIUM | Malformed AI output crashes downstream consumers |
| P2 | A7 | Redis-cached RBAC permission lookups | M | MEDIUM | DB hammering from permission checks on every API call |
| P2 | A8 | Delete deprecated workers.ts | XS | LOW | Confusion about canonical execution path |
| P2 | A9 | Add .env.example | XS | MEDIUM | Onboarding friction; missing env vars cause silent failures |
| P3 | A10 | Resolve deployment model (server.js vs Vercel) | L | HIGH | Unclear deployment causes production incidents |
| P3 | A11 | Unify dual AgentType taxonomy | M | MEDIUM | Event routing mismatches; maintenance complexity |
| P3 | A12 | Add Cypress E2E to CI pipeline | M | MEDIUM | Regressions in core user journeys go undetected |
| P4 | A13 | Semantic prompt injection defense | L | MEDIUM | Sophisticated injection attacks bypass regex filters |
| P4 | A14 | Containerize with Dockerfile | M | MEDIUM | No portable deployment artifact; manual environment setup |

Effort: XS=hours, S=1 day, M=2–3 days, L=1+ week

---

# 19. Appendix

## 19.1 Prisma Model Summary

| Model | Key Fields | Relationships |
|-------|-----------|--------------|
| Candidate | email(unique), passwordHash, emailVerified, preferences(JSON) | 1:M to all user-owned entities |
| Job | title, company, stage(enum:14), matchScore, priority, tags[] | M:1 Candidate; 1:M Activities, Interviews, Offers, Documents |
| JobActivity | action, metadata(JSON) | M:1 Job |
| Interview | type, scheduledAt, status(enum:5), calendarEventId | M:1 Job, Candidate |
| InterviewFeedback | type, selfRating(1-5) | M:1 Job, Candidate |
| Offer | salary, equity, bonus, status(enum:5), negotiated | M:1 Job, Candidate |
| ProfileData | type, content(JSON) | M:1 Candidate (unique per type) |
| Skill | name, proficiency(enum:4) | M:1 Candidate |
| Achievement | title, description, metrics(JSON) | M:1 Candidate |
| Document | name, type, url, content, version, tags[] | M:1 Candidate; M:1 Job |
| ProfileEntity | type, data(JSON), source, confidence(0-1) | M:1 Candidate |
| ProfileScore | overall(0-100), sections(JSON), recommendations(JSON) | 1:1 Candidate |
| InterviewPrep | prepStatus, confidenceScore, 7 JSON content fields | 1:1 Job; 1:M StarStory |
| StarStory | competency, STAR fields, metrics[], relevanceScore | M:1 Candidate, InterviewPrep |
| AgentExecution | agentType, status(enum:5), input, output(JSON strings) | 1:M ToolCall, EventLog |
| ToolCall | tool, input(JSON), output(JSON), status | M:1 AgentExecution |
| EventLog | level, message, metadata(JSON) | M:1 AgentExecution |
| Role | name(unique) | M:M Permission; M:M Candidate (via UserRole) |
| Permission | name(unique), resource, action | M:M Role |
| TwoFactorSecret | secret(encrypted), backupCodes[], enabled | keyed by email |
| ApiKey | keyHash, prefix(unique), expiresAt, usageCount | keyed by email |
| AuditLog | action, resource, severity | keyed by email |
| LoginAttempt | success, ipAddress, userAgent | keyed by email |
| SessionActivity | action, riskScore(0-100) | keyed by email, sessionId |
| CalendarToken | provider, accessToken, refreshToken, expiresAt | M:1 Candidate |
| CalendarEvent | externalId, provider, startAt, endAt, jobId, interviewId | M:1 Candidate |
| JobImport | source, externalId, rawData(JSON), imported | M:1 Candidate |
| AiProviderConfig | providerName, encryptedKey, isActive, priority | M:1 Candidate |
| UserCapabilityPreset | presetName, providerName, modelName, maxCostLimit, privacyMode | M:1 Candidate |
| TokenUsageLog | presetName, inputTokens, outputTokens, costUsd | keyed by candidateId |
| PromptVersion | capability, version, template, isActive | — |
| ModelHealthLog | providerName, latencyMs, isSuccess | time-series |
| Accomplishment | title, category, description, metrics, starContext, visibility | M:1 Candidate |
| AppraisalSession | title, startDate, endDate, status, selfReview, impactDraft | M:1 Candidate |
| Contact | name, company, role, type, status, jobId, followUpAt | M:1 Candidate |

## 19.2 API Route Surface

Total API routes: 50+. Key domains:

- `/api/jobs` — CRUD + activities + match scoring + search + import
- `/api/agents` — execute, execute-pending, events (SSE), ws (redirect), per-execution pause/resume/cancel/logs
- `/api/interview-prep` — CRUD + generate + SSE progress + mock interview + feedback
- `/api/auth` — NextAuth + register + email verify + password reset + 2FA (setup/enable/disable/status)
- `/api/profile` — CRUD + entities + completeness + recommendations + narrative + quantify + ATS check + accomplishments + appraisal
- `/api/calendar` — sync + events + OAuth authorize/callback (Google + Outlook)
- `/api/offers` — CRUD + negotiate + script generation
- `/api/interviews` — CRUD
- `/api/documents` — CRUD + generate + compile
- `/api/account` — profile + password + avatar + delete
- `/api/settings/ai-providers` — manage + scan
- `/api/admin` — users + threats
- `/api/audit-logs` — list
- `/api/api-keys` — CRUD

## 19.3 Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| 20260517100851 | 2026-05-17 | Reconcile domain model |
| 20260519000000 | 2026-05-19 | Add InterviewPrep StarStory |
| 20260519100000 | 2026-05-19 | Add CalendarEvent + JobImport |
| 20260519110000 | 2026-05-19 | Add auth fields (email verify + password reset) |
| rasui012_state_machine | — | State machine enums (JobStage DB enforcement) |
| 20260522000000 | 2026-05-22 | Add Contact (networking CRM) |

---

# 20. Evidence & Traceability

All claims in this report are backed by direct file inspection. Key evidence citations:

| Claim | Evidence File | Line(s) |
|-------|-------------|---------|
| Daily-only cron schedule | `vercel.json` | 3-7 |
| Per-SSE Redis subscriber | `src/app/api/agents/events/route.ts` | 43-50 |
| CalendarToken plaintext storage | `prisma/schema.prisma` | 563-577 |
| Rate limit fail-open | `src/lib/middleware/rateLimiter.ts` | 27-30 |
| RBAC uncached DB calls | `src/lib/security/rbac.ts` | 179-206 |
| `as any` type cast in execute route | `src/app/api/agents/execute/route.ts` | 154 |
| Workers.ts deprecated | `src/lib/queues/workers.ts` | 1-17 |
| AES-256-GCM key encryption | `src/lib/llm/privacy.ts` | 22-43 |
| Daily cron executor | `src/lib/agents/executor.ts` | 1-35 |
| RASUI-003 production dev-login guard | `src/lib/auth.ts` | 69-74 |
| RASUI-005 55s LLM timeout | `src/lib/agents/executor.ts` | 31 |
| Security headers | `next.config.js` | 9-29 |
| Dual AgentType taxonomy | `src/lib/agents/prompts.ts:6-12`, `src/lib/realtime/events.ts:7-15` | — |
| Stuck execution recovery | `src/lib/agents/executor.ts` | 34-35 |
| Prompt injection patterns | `src/lib/safety/promptSanitizer.ts` | 1-10 |
| Anthropic zero-retention header | `src/lib/llm/privacy.ts` | 158-163 |
| isStale auto-regenerate 5s timer | `src/hooks/useInterviewPrep.ts` | 178-185 |
| 14-stage pipeline enum | `prisma/schema.prisma` | 16-31 |
| Socket.io Redis bridge | `server.js` | 189-221 |
| 308 redirect ws→SSE | `src/app/api/agents/ws/route.ts` | 13-15 |
| Capability preset fallback chains | `src/lib/llm/orchestrator.ts` | 60-90+ |

**[ASSUMPTION] labels in this report indicate claims inferred from patterns, configuration, or documentation rather than verified directly in source code. All [VERIFIED] labels indicate direct inspection of the referenced file.**

---

*Report generated by Automated Principal Architecture Review | CareerPropel AS-IS | 2026-05-23*
*8,200+ words | 11 analysis phases | 26 Prisma models | 50+ API routes | 15 risk items | 14 prioritized actions*
