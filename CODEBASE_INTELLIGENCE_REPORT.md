# CODEBASE INTELLIGENCE REPORT
**Repository:** `career-propel`  
**Report Date:** 2026-05-17  
**Analyst:** Automated Technical Reconnaissance  
**Scope:** Full-spectrum architecture, dependency, security, and operations audit

---

## 1. Executive Summary

| Field | Value |
|---|---|
| **Repository Purpose** | AI-native career management platform with autonomous job application automation ("CareerPropel") |
| **Primary Architecture** | Modular Monolith — single Next.js 14 App Router application with custom Node.js server |
| **Primary Stack** | TypeScript · Next.js 14 · React 18 · PostgreSQL (Prisma) · Redis · Socket.io · Anthropic Claude API |
| **Major Integrations** | Anthropic Claude API, Nvidia NIM (LLM), NextAuth (GitHub/Google OAuth), Redis pub/sub, Socket.io real-time |
| **Operational Maturity** | Mid — strong domain modeling and security intent; several critical in-memory state issues; no Docker/Kubernetes; one CI workflow |
| **Security Posture** | Mixed — thoughtful security surface (2FA, RBAC, audit logs, rate limiting, prompt injection protection) but several implementation weaknesses (see §9) |

---

## 2. Technology Inventory

| Category | Technology | Version | Usage | Confidence | Evidence |
|---|---|---|---|---|---|
| Runtime Framework | Next.js | ^14.0.0 | Full-stack SSR + API routes | VERIFIED | `package.json` |
| UI Library | React | ^18.2.0 | Frontend rendering | VERIFIED | `package.json` |
| Language | TypeScript | ^5.2.0 | All source files | VERIFIED | `tsconfig.json` |
| Language (server) | JavaScript | — | `server.js` | VERIFIED | `server.js` |
| ORM | Prisma | ^5.0.0 | Database access layer | VERIFIED | `package.json`, `prisma/schema.prisma` |
| Database | PostgreSQL | — | Primary data store | VERIFIED | `prisma/schema.prisma` datasource |
| Cache / Queue | Redis | ^4.6.0 (redis), ^5.10.1 (ioredis) | Pub/sub, job queue, agent state | VERIFIED | `package.json`, `src/lib/redis/redisClient.ts` |
| Real-time Transport | Socket.io | ^4.7.0 | WebSocket server + client | VERIFIED | `package.json`, `server.js`, `src/lib/socket/server.ts` |
| AI SDK | @anthropic-ai/sdk | ^0.96.0 | Claude claude-3-5-sonnet-20241022 | VERIFIED | `src/lib/llm/anthropic.ts` |
| AI Provider (alt) | Nvidia NIM | — | REST API; meta/llama2-70b-chat default | VERIFIED | `src/lib/llm/nvidia-nim.ts` |
| Auth Framework | NextAuth | ^4.24.14 | JWT sessions, OAuth, credentials | VERIFIED | `package.json`, `src/lib/auth.ts` |
| UI Component Lib | MUI (Material UI) | ^9.0.1 | Component system | VERIFIED | `package.json`, `src/app/providers.tsx` |
| CSS-in-JS | Emotion | ^11.14.x | MUI theming engine | VERIFIED | `package.json` |
| Utility CSS | Tailwind CSS | ^3.3.0 | Styling utility classes | VERIFIED | `package.json`, `tailwind.config.js` |
| State Management | Zustand | ^4.4.0 | Client-side global state | VERIFIED | `package.json` |
| Data Fetching | TanStack React Query | ^5.0.0 | Server state, caching | VERIFIED | `package.json` |
| HTTP Client | Axios | ^1.5.0 | API client calls | VERIFIED | `package.json` |
| Schema Validation | Zod | ^3.22.0 | Request validation, env schema | VERIFIED | `package.json`, `src/lib/config.ts`, `src/lib/validation/schemas.ts` |
| Structured Logging | Pino | ^8.16.0 | Server-side logging | VERIFIED | `package.json` |
| TOTP / 2FA | Speakeasy | ^2.0.0 | TOTP secret generation + verification | VERIFIED | `package.json`, `src/lib/security/twoFactor.ts` |
| QR Code | qrcode | ^1.5.4 | 2FA QR code generation | VERIFIED | `package.json`, `src/lib/security/twoFactor.ts` |
| Linter | ESLint | ^8.48.0 | Code quality enforcement | VERIFIED | `package.json`, `.eslintrc.json` |
| Formatter | Prettier | ^3.0.0 | Code formatting | VERIFIED | `package.json`, `.prettierrc.json` |
| Type Checking | tsc (TypeScript compiler) | strict mode | CI step via `npm run type-check` | VERIFIED | `tsconfig.json` |
| Testing (Unit) | Jest | ^29.7.0 | Unit tests | VERIFIED | `package.json` |
| Testing (E2E) | Playwright | ^1.40.0 | End-to-end tests | VERIFIED | `package.json` |
| Testing (React) | @testing-library/react | ^14.0.0 | Component testing | VERIFIED | `package.json` |
| CI | GitHub Actions | — | Lighthouse CI only | VERIFIED | `.github/workflows/lighthouse.yml` |
| Deployment Target | Vercel | — | Referenced in multiple docs | INFERRED | `DEPLOYMENT_VERCEL.md`, auth.ts error comments |
| Performance CI | Lighthouse CI | v10 | Web vitals on push/PR | VERIFIED | `.github/workflows/lighthouse.yml` |

---

## 3. Languages & Frameworks

| Language | Frameworks / Runtimes | Locations | Confidence |
|---|---|---|---|
| TypeScript | Next.js 14 App Router, React 18, Prisma, Socket.io | `src/**/*.ts`, `src/**/*.tsx` | VERIFIED |
| JavaScript | Node.js, Socket.io | `server.js`, `tailwind.config.js` | VERIFIED |

**Language Distribution (estimated):**
- TypeScript: ~95%
- JavaScript: ~5% (server entry, config files)

---

## 4. Dependency Analysis

### Runtime Dependencies
| Package | Version | Purpose |
|---|---|---|
| `@anthropic-ai/sdk` | ^0.96.0 | Claude LLM API calls (streaming + standard) |
| `@emotion/react` + `@emotion/styled` | ^11.14.x | MUI CSS-in-JS engine |
| `@mui/icons-material` | ^9.0.1 | Icon library |
| `@mui/lab` | ^9.0.0-beta.3 | MUI experimental components (beta) |
| `@mui/material` | ^9.0.1 | Component UI system |
| `@prisma/client` | ^5.0.0 | PostgreSQL ORM client |
| `@tanstack/react-query` | ^5.0.0 | Server state, query caching |
| `axios` | ^1.5.0 | HTTP client for external API calls |
| `ioredis` | ^5.10.1 | Redis client (primary, with pub/sub) |
| `next` | ^14.0.0 | Next.js framework |
| `next-auth` | ^4.24.14 | Authentication |
| `pino` | ^8.16.0 | Structured logging |
| `prisma` | ^5.0.0 | ORM + migrations CLI |
| `qrcode` | ^1.5.4 | QR code generation (2FA setup) |
| `react` + `react-dom` | ^18.2.0 | UI library |
| `redis` | ^4.6.0 | Secondary Redis client |
| `socket.io` + `socket.io-client` | ^4.7.0 | WebSocket real-time layer |
| `speakeasy` | ^2.0.0 | TOTP / 2FA |
| `tailwindcss` | ^3.3.0 | Utility CSS |
| `typescript` | ^5.2.0 | Language |
| `zod` | ^3.22.0 | Schema validation |
| `zustand` | ^4.4.0 | Client state management |

### Development Dependencies
| Package | Version | Purpose |
|---|---|---|
| `@prisma/internals` | ^5.0.0 | Prisma internal utilities |
| `@testing-library/jest-dom` | ^6.1.0 | Jest DOM matchers |
| `@testing-library/react` | ^14.0.0 | React testing utilities |
| `@types/node` | ^20.5.0 | Node type definitions |
| `@types/react` + `@types/react-dom` | ^18.2.0 | React type definitions |
| `@types/uuid` | ^10.0.0 | UUID type definitions |
| `@typescript-eslint/eslint-plugin` + `@typescript-eslint/parser` | ^6.0.0 | TypeScript ESLint rules |
| `eslint` | ^8.48.0 | Linting |
| `eslint-config-next` | ^14.0.0 | Next.js ESLint preset |
| `jest` | ^29.7.0 | Unit test runner |
| `jest-environment-jsdom` | ^30.4.1 | JSDOM environment for Jest |
| `playwright` | ^1.40.0 | E2E browser testing |
| `prettier` | ^3.0.0 | Code formatting |

### Build Dependencies
None declared separately — Next.js build is invoked via `npm run build`.

### Risky / Deprecated Dependencies
| Package | Risk | Notes |
|---|---|---|
| `@mui/lab` v9.0.0-beta.3 | MEDIUM | Beta package — APIs may change without semver guarantees |
| `next-auth` v4.x | LOW-MEDIUM | v4 is maintained but v5 (Auth.js) is the active development line; migration will be needed |
| `speakeasy` | LOW | Last major release is 2018; consider `otplib` as a maintained alternative |
| `redis` v4 AND `ioredis` v5 | LOW | Two Redis clients in the same project; ioredis is the primary; redis package appears redundant |

---

## 5. SDK & API Discovery

| Provider | SDK/API | Usage | Auth Method | Evidence |
|---|---|---|---|---|
| Anthropic Claude | `@anthropic-ai/sdk` | LLM inference (standard + streaming), default model `claude-3-5-sonnet-20241022` | API Key (`ANTHROPIC_API_KEY`) | `src/lib/llm/anthropic.ts` |
| Nvidia NIM | REST HTTP (`fetch`) | Alternative LLM inference; model `meta/llama2-70b-chat` by default | Bearer token (`NIM_API_KEY`) | `src/lib/llm/nvidia-nim.ts` |
| GitHub OAuth | `next-auth/providers/github` | Social login | OAuth (`GITHUB_ID`, `GITHUB_SECRET`) | `src/lib/auth.ts` |
| Google OAuth | `next-auth/providers/google` | Social login | OAuth (`GOOGLE_ID`, `GOOGLE_SECRET`) | `src/lib/auth.ts` |
| Vercel | Deployment platform | Hosting; mentioned in docs and env variable errors | Platform secrets | `DEPLOYMENT_VERCEL.md`, `src/lib/auth.ts` comments |

---

## 6. External Integrations

| Service | Purpose | Integration Method | Files |
|---|---|---|---|
| Anthropic Claude API | Resume tailoring, interview prep, research agent, follow-up drafting | `@anthropic-ai/sdk` messages API with streaming | `src/lib/llm/anthropic.ts`, `src/lib/agents/executor.ts` |
| Nvidia NIM | Alternative LLM provider (Llama 2 70B) | REST API via native `fetch` | `src/lib/llm/nvidia-nim.ts` |
| GitHub OAuth | Social sign-in | NextAuth GitHub provider | `src/lib/auth.ts` |
| Google OAuth | Social sign-in | NextAuth Google provider | `src/lib/auth.ts` |
| PostgreSQL | Persistent storage | Prisma ORM; connection via `DATABASE_URL` | `prisma/schema.prisma`, `src/lib/db.ts` |
| Redis | Job queue, pub/sub, agent state cache | `ioredis` for primary client | `src/lib/redis/redisClient.ts`, `src/lib/queues/jobQueue.ts`, `src/lib/agents/redis-integration.ts` |
| Google Authenticator / Authy | TOTP-based 2FA | `speakeasy` TOTP library | `src/lib/security/twoFactor.ts` |
| Lighthouse CI | Web performance metrics on every PR | `treosh/lighthouse-ci-action@v10` GitHub Action | `.github/workflows/lighthouse.yml` |

---

## 7. Infrastructure & DevOps

### CI/CD
- **GitHub Actions** — one workflow: `.github/workflows/lighthouse.yml`
  - Triggers: push to `main`/`develop`, PRs to `main`/`develop`
  - Steps: checkout → Node.js 18 → `npm ci` → `npm run build` → start server → Lighthouse CI → comment on PR
  - **No test, lint, or type-check steps in CI** (POSSIBLE gap)

### Containers
- **No Dockerfile found** — VERIFIED absent
- **No docker-compose** — VERIFIED absent

### Orchestration
- **No Kubernetes, Helm, or Terraform** — VERIFIED absent

### Cloud Services
- **Vercel** — deployment target (INFERRED from docs and error messages in code)
- **PostgreSQL** — database hosted externally (provider UNRESOLVED; likely Vercel Postgres, Supabase, Neon, or self-hosted)
- **Redis** — externally hosted (provider UNRESOLVED; likely Upstash, Redis Cloud, or self-hosted)

### IaC
- None found — VERIFIED

### Deployment Model
- Node.js server (`server.js`) with Socket.io attached to Next.js request handler
- `npm run start` = `node server.js` (production)
- `npm run dev` = `next dev` (development — Socket.io NOT available in dev mode via this path)

---

## 8. Environment & Configuration

| Variable / Config | Purpose | Sensitivity | Referenced In |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | **CRITICAL** | `prisma/schema.prisma`, `src/lib/config.ts` |
| `REDIS_URL` | Redis connection string | **HIGH** | `src/lib/config.ts` |
| `REDIS_HOST` | Redis host (alternative to URL) | **HIGH** | `src/lib/redis/redisClient.ts` |
| `REDIS_PORT` | Redis port | MEDIUM | `src/lib/redis/redisClient.ts` |
| `REDIS_PASSWORD` | Redis auth password | **HIGH** | `src/lib/redis/redisClient.ts` |
| `REDIS_DB` | Redis database index | LOW | `src/lib/redis/redisClient.ts` |
| `NEXTAUTH_SECRET` | JWT signing secret | **CRITICAL** | `src/lib/auth.ts`, `src/lib/security/twoFactor.ts` |
| `NEXTAUTH_URL` | App canonical URL | HIGH | `src/lib/auth.ts`, `src/lib/config.ts` |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | **CRITICAL** | `src/lib/llm/anthropic.ts` |
| `NIM_API_KEY` | Nvidia NIM API key | **HIGH** | `src/lib/llm/nvidia-nim.ts` |
| `NIM_BASE_URL` | Nvidia NIM endpoint | MEDIUM | `src/lib/llm/nvidia-nim.ts` |
| `NIM_MODEL` | Nvidia NIM model name | LOW | `src/lib/llm/nvidia-nim.ts` |
| `LLM_PROVIDER` | Select 'anthropic' or 'nvidia-nim' | MEDIUM | `src/lib/llm/provider.ts` |
| `GITHUB_ID` + `GITHUB_SECRET` | GitHub OAuth app credentials | **HIGH** | `src/lib/auth.ts` |
| `GOOGLE_ID` + `GOOGLE_SECRET` | Google OAuth app credentials | **HIGH** | `src/lib/auth.ts` |
| `NODE_ENV` | Environment mode | LOW | `src/lib/config.ts`, `src/lib/db.ts`, `server.js` |
| `LOG_LEVEL` | Pino log level | LOW | `src/lib/config.ts` |
| `PORT` | HTTP server port (default 3000) | LOW | `server.js` |
| `HOSTNAME` | Server hostname | LOW | `server.js` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | MEDIUM | `server.js` |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend API base URL | LOW | `src/lib/middleware/cors.ts` |

**Config system**: Zod schema validation at startup (`src/lib/config.ts`) validates `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_URL`, `NODE_ENV`, `LOG_LEVEL`. Other variables are consumed ad-hoc from `process.env`.

---

## 9. Security Findings

| Severity | Finding | Evidence | Recommendation |
|---|---|---|---|
| **CRITICAL** | Debug API endpoints exposed in production (`/api/debug/auth-config`, `/api/debug/db-check`) | Route files at `src/app/api/debug/auth-config/route.ts`, `src/app/api/debug/db-check/route.ts` | Remove or gate behind `NODE_ENV === 'development'` AND require admin auth |
| **HIGH** | Socket.io token authentication is not cryptographic — uses base64-decoding of `email:userId` without signature verification | `server.js` lines 59–67: `Buffer.from(token, 'base64').toString('utf-8')` | Verify JWT/NextAuth token using `getToken()` from `next-auth/jwt` |
| **HIGH** | TOTP secret stored in plaintext in database | `prisma/schema.prisma` `TwoFactorSecret.secret` is a plain `String`; `twoFactor.ts` writes raw secret | Encrypt TOTP secrets at-rest using AES-256-GCM before storage |
| **HIGH** | 2FA session state stored in process memory (`global.twoFASessions`) | `src/lib/security/twoFactor.ts` lines 200–207 | Migrate to Redis with TTL for multi-instance safety |
| **HIGH** | Rate limiter uses in-memory Map — ineffective in multi-instance and resets on restart | `src/lib/middleware/rateLimiter.ts` comment: "In production, use Redis" | Implement Redis-backed sliding window rate limiter |
| **HIGH** | CSRF tokens stored in process memory — ineffective in multi-instance and resets on restart | `src/lib/security/csrfToken.ts` comment: "In production, use Redis" | Migrate to Redis with expiration |
| **MEDIUM** | Development credential provider accepts ANY email and auto-creates users | `src/lib/auth.ts` lines 86–99: `devUsers.set(email, newUser)` — no password check | Add a feature flag or `NODE_ENV` guard; disable in production |
| **MEDIUM** | `NEXTAUTH_SECRET` used as HMAC key for backup code hashing (dual-use) | `src/lib/security/twoFactor.ts` line 77: `createHmac('sha256', process.env.NEXTAUTH_SECRET \|\| 'secret')` | Use a dedicated `BACKUP_CODE_SECRET` env variable |
| **MEDIUM** | `|| 'secret'` fallback in HMAC key — crypto weakened if env var missing | `src/lib/security/twoFactor.ts` line 77 | Remove fallback; throw on missing secret |
| **MEDIUM** | Schema mismatch: `AuditLog` model has `email` field but `auditLog.ts` code references `candidateId` | `prisma/schema.prisma` (AuditLog model has `email`) vs `src/lib/logging/auditLog.ts` line 80: `.create({ data: { candidateId: ... }})` | Align code with schema; likely a migration artifact |
| **MEDIUM** | `AgentExecution` and `EventLog` models referenced in executor but absent from `prisma/schema.prisma` | `src/lib/agents/executor.ts` lines 36, 84, 139; `prisma/schema.prisma` has no such models | Add missing models to schema or correct the code reference |
| **MEDIUM** | `Candidate` model lacks `twoFactorEnabled`/`totpSecret` fields that `twoFactor.ts` expects | `prisma/schema.prisma` Candidate model vs `src/lib/security/twoFactor.ts` lines 122, 135, 230 | Reconcile: either add fields to Candidate or update service to use `TwoFactorSecret` model |
| **LOW** | `ApiKey` model schema uses `candidateId` but `apiKey.ts` service inconsistently references both `candidateId` and `email` | `prisma/schema.prisma` vs `src/lib/security/apiKey.ts` | Standardize on one lookup key |
| **LOW** | Analytics module imports `ApplicationStage` from `@prisma/client` but schema uses plain string stages | `src/lib/analytics/export.ts` line 7 | Update analytics to use string literals matching schema |
| **LOW** | Two redundant Redis client libraries (`redis` v4 AND `ioredis` v5) in the same project | `package.json` | Remove unused `redis` package; consolidate on `ioredis` |
| **LOW** | `eslint` rules set to `warn` for `@typescript-eslint/no-explicit-any` — `any` use prevalent | `.eslintrc.json` | Escalate to `error`; resolve existing `any` usages |

---

## 10. Architecture Assessment

### Architectural Style
**Modular Monolith** — single deployable Next.js application organized into domain-oriented modules.  
- No microservices boundary observed
- Domain folders under `src/domains/` (jobs, agents, documents, interviews)
- Shared library under `src/lib/` (auth, db, llm, security, realtime, queues)

### Service Topology
```
Browser (React + Socket.io-client)
        │
        │  HTTP / WebSocket
        ▼
Node.js HTTP Server (server.js)
        │─── Next.js App Router (pages + API routes)
        │─── Socket.io Server (real-time job/user rooms)
        │
        ├── Prisma ORM ──────► PostgreSQL
        ├── ioredis ─────────► Redis (pub/sub + queue + state cache)
        └── fetch / @anthropic-ai/sdk ─► Anthropic Claude API
                                        (or Nvidia NIM via REST)
```

### Data Flow (Agent Execution)
1. Client POSTs to `/api/agents/execute`
2. API route creates `AgentExecution` record in PostgreSQL (status: `queued`)
3. Executor reads pending executions via `processPendingExecutions()`
4. Executor streams from Claude API (or Nvidia NIM)
5. Every 50 tokens: writes `EventLog` to PostgreSQL
6. On completion: updates `AgentExecution`, publishes to Redis pub/sub channels
7. WebSocket server receives Redis message → broadcasts to connected clients via Socket.io rooms

### Communication Patterns
- **Frontend ↔ Backend**: REST API (Next.js API routes) + WebSocket (Socket.io)
- **Backend ↔ AI**: Streaming HTTP (SSE-style) via `@anthropic-ai/sdk` or native `fetch`
- **Backend ↔ Redis**: `ioredis` for sorted set queue, hash storage, pub/sub channels
- **Inter-component**: Redis pub/sub as event bus between API routes and WebSocket server

### Authentication Flow
1. User submits credentials → NextAuth CredentialsProvider (or GitHub/Google OAuth)
2. JWT token created and stored in HTTP-only cookie (`next-auth.session-token`)
3. Middleware (`src/middleware.ts`) checks cookie presence on all non-public routes
4. API routes validate session via `getServerSession(authOptions)`
5. Optional 2FA flow: separate TOTP verification session stored in `global.twoFASessions`
6. API key auth: `sk_` prefix keys stored as SHA-256 hash in `ApiKey` table

### Authorization Model
- **RBAC** defined in `src/lib/security/rbac.ts`
- Roles: `admin`, `recruiter`, `candidate`
- Permissions: resource+action pairs (e.g., `jobs.create`, `users.manage`)
- Role-permission mapping stored in PostgreSQL (`Role`, `Permission`, `RolePermission`, `UserRole` tables)

### State Management
- **Server state**: PostgreSQL (Prisma) — authoritative
- **Cache/queue**: Redis — transient agent state, job queues, event pub/sub
- **Client state**: Zustand stores + TanStack React Query cache
- **Session state**: JWT in HTTP-only cookie (NextAuth)

### Scalability Observations
- **Bottleneck**: In-memory state (rate limiter, CSRF, 2FA sessions) prevents horizontal scaling
- **Agent concurrency**: Per-type limits enforced via Redis sorted sets and sets — sound design
- **Socket.io without Redis adapter**: Multi-instance WebSocket will not work without `@socket.io/redis-adapter`
- **Database**: PostgreSQL with Prisma; no read replica or connection pooling configuration detected

### Technical Debt Observations
- Schema-code mismatches (4 identified above) indicate rapid iterative development with schema changes not synchronized
- Two distinct WebSocket implementations: `server.js` (Socket.io) and `src/lib/realtime/wsServer.ts` (native WS) — potential duplication
- `src/lib/queues/workers.ts` exists but not audited (may contain background job logic)
- Multiple overlapping route handlers for similar concerns (e.g., both `/api/ws` and `/api/agents/ws`)
- `@mui/lab` beta dependency introduces API stability risk

---

## 11. Observability & Operations

### Logging
| System | Details | Evidence |
|---|---|---|
| Pino | Structured JSON logging on server (`^8.16.0`) | `package.json` |
| Console.log/warn/error | Extensive ad-hoc use throughout lib | Multiple `src/lib/**/*.ts` files |
| Audit Log | Custom PostgreSQL-backed audit trail (`AuditLog` model) | `src/lib/logging/auditLog.ts` |

**Log levels**: Configurable via `LOG_LEVEL` env var (validated by Zod: debug/info/warn/error)

### Metrics
- No dedicated metrics framework detected (no Prometheus, Datadog, OpenTelemetry)
- Agent token counts and duration stored per-execution in PostgreSQL
- Analytics module computes application funnel metrics from PostgreSQL data

### Tracing
- No distributed tracing found (no OpenTelemetry, Jaeger, Zipkin) — VERIFIED absent

### Alerting
- `alertSecurityTeam()` in `src/lib/logging/auditLog.ts` — currently only logs to console (`console.warn`)
- No PagerDuty, Slack webhook, or email alerting implemented

### Monitoring
- **Lighthouse CI** on every push/PR — web vitals only
- No application performance monitoring (APM) detected

---

## 12. Unknowns & Unresolved Components

| Component | Why Unresolved | Suggested Investigation |
|---|---|---|
| `src/lib/queues/workers.ts` | Not read; likely background job processor | Read file; verify what work it performs and how it's invoked |
| `src/lib/profile/profileService.ts` | Not read; profile service implementation | Read file for AI-powered profile features |
| `src/lib/interview/prepService.ts` | Not read; may contain production LLM calls | Read file to understand LLM usage in interview prep flow |
| `src/lib/agent/agentService.ts` (different from `agents/`) | Duplicate? Different from `src/lib/agents/`? | Read to understand difference from Phase 2 executor |
| PostgreSQL hosting provider | Not evidenced — only `DATABASE_URL` env var | Check Vercel project settings or `.env.local` |
| Redis hosting provider | Not evidenced — `REDIS_HOST/URL` env vars | Check Vercel project settings or `.env.local` |
| `lighthouserc.json` | Referenced in CI workflow but not found in repo | Create or locate; CI will fail without it |
| `AgentExecution` / `EventLog` Prisma models | Referenced in executor but absent from `schema.prisma` | Determine if migration was not run or if schema needs update |
| Socket.io Redis adapter | Multi-instance deployment requires it but not found | Add `@socket.io/redis-adapter` for production horizontal scale |
| `.env.local` | Contains actual secrets; access denied during scan | Review manually for hardcoded secrets |

---

## 13. Dependency Graph Summary

```
career-propel (Next.js 14 Monolith)
│
├─ FRONTEND LAYER
│   ├─ React 18 (rendering)
│   │   ├─ MUI v9 (component system) ← Emotion (CSS-in-JS)
│   │   ├─ Tailwind CSS (utilities)
│   │   ├─ Zustand (global state)
│   │   └─ TanStack React Query (server state cache)
│   └─ Socket.io Client (real-time)
│
├─ API LAYER (Next.js App Router routes)
│   ├─ NextAuth v4 (auth: JWT + OAuth)
│   ├─ Zod (request validation)
│   ├─ Axios (outbound HTTP)
│   ├─ Pino (logging)
│   └─ Custom middleware (CORS, rate limit, CSRF, auth)
│
├─ SERVICE LAYER (src/lib/)
│   ├─ LLM Provider Abstraction
│   │   ├─ AnthropicProvider → @anthropic-ai/sdk → Anthropic API
│   │   └─ NvidiaNimProvider → fetch → Nvidia NIM API
│   ├─ Agent Executor (streaming LLM + Prisma + Redis pub/sub)
│   ├─ Job Queue (Redis sorted sets + sets)
│   ├─ Security (RBAC, 2FA/TOTP, API Keys, Threat Detection, Audit Log)
│   ├─ Real-time (Redis pub/sub → WebSocket broadcast)
│   └─ Profile / Interview / Analytics services
│
├─ PERSISTENCE LAYER
│   ├─ Prisma ORM → PostgreSQL (primary data)
│   └─ ioredis → Redis (queue, pub/sub, cache)
│
├─ REAL-TIME LAYER
│   └─ Socket.io Server (HTTP server attachment in server.js)
│
└─ EXTERNAL SERVICES
    ├─ Anthropic Claude API (primary AI)
    ├─ Nvidia NIM API (fallback AI)
    ├─ GitHub OAuth
    └─ Google OAuth
```

---

## 14. Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Core dependency inventory | HIGH | `package.json` is authoritative and fully read |
| Database schema | HIGH | `prisma/schema.prisma` fully read |
| Authentication architecture | HIGH | `src/lib/auth.ts`, `src/middleware.ts` fully read |
| AI/LLM integration | HIGH | Both providers fully read |
| Redis usage patterns | HIGH | Queue, pub/sub, state cache all traced through code |
| Security implementation | HIGH | 6 security modules fully read |
| API route inventory | HIGH | All route files listed; key routes sampled |
| Frontend component architecture | MEDIUM | Component files listed but not deeply read |
| Environment variable completeness | MEDIUM | Inferred from code; `.env.local` inaccessible |
| CI/CD completeness | HIGH | Only one workflow file found |
| Infrastructure / cloud specifics | LOW | No IaC, no Docker; Vercel inferred from docs only |
| PostgreSQL / Redis hosting | UNRESOLVED | Provider unknown; requires env var inspection |
| Test coverage | LOW | No test files found; test tooling installed but no tests observed |
| `src/lib/queues/workers.ts` | UNRESOLVED | Not read |
| Schema-code alignment | LOW | 4 mismatches found; likely more undetected |

---

## 15. Final Recommendations

### Critical
1. **Remove or protect debug endpoints** (`/api/debug/auth-config`, `/api/debug/db-check`) — these may expose database connection strings, auth configuration, and internal state to unauthenticated users. Guard with `NODE_ENV !== 'production'` AND admin authentication immediately.

2. **Fix Socket.io authentication** — the base64 decode approach in `server.js` is trivially bypassable (anyone can forge a `email:userId` string encoded in base64). Replace with `next-auth/jwt` `getToken()` verification using `NEXTAUTH_SECRET`.

3. **Encrypt TOTP secrets at rest** — `totpSecret` is stored as a plain string in the database. An attacker with database access can immediately take over any 2FA-protected account. Encrypt with AES-256-GCM using a dedicated key.

4. **Resolve schema-code mismatches** — the application likely crashes or silently fails for: `AgentExecution`/`EventLog` models not in schema, `AuditLog.candidateId` field not in schema, `Candidate.twoFactorEnabled` not in schema. Run `prisma validate` and reconcile.

### High
5. **Migrate in-memory state to Redis** — rate limiter, CSRF token store, and 2FA sessions must move to Redis to enable horizontal scaling and survive restarts. Comments in the code already acknowledge this.

6. **Add `@socket.io/redis-adapter`** — without it, Socket.io rooms are local to one process. Any multi-instance Vercel deployment will break real-time features.

7. **Add CI steps for tests, type-check, and lint** — the current CI workflow only runs Lighthouse. Add: `npm run type-check`, `npm run lint`, `npm test` as required checks before merge.

8. **Remove the no-password development login** — the CredentialsProvider currently creates users from any email without a password. This MUST be disabled in production via a feature flag or `NODE_ENV` check.

### Medium
9. **Deduplicate Redis clients** — remove the `redis` package (v4) and standardize on `ioredis` (v5) throughout the codebase to eliminate confusion and reduce bundle size.

10. **Elevate `@typescript-eslint/no-explicit-any` to `error`** — `any` types suppress type safety. The ESLint config has it as `warn`; promote to `error` and resolve existing usages.

11. **Separate the `NEXTAUTH_SECRET` from HMAC key** — `twoFactor.ts` uses `NEXTAUTH_SECRET` as a backup code HMAC key. Introduce `BACKUP_CODE_HMAC_SECRET` to follow least-privilege key usage.

12. **Add APM / distributed tracing** — no observability beyond Pino logs and PostgreSQL audit records. Add OpenTelemetry (or Vercel's built-in telemetry) for request tracing across the LLM, DB, and Redis boundaries.

### Low
13. **Upgrade or replace `speakeasy`** — last major release 2018; consider migrating to `otplib` (actively maintained, ESM-native).

14. **Pin `@mui/lab` to a stable version** — the beta designation means breaking API changes can arrive without major version bumps.

15. **Verify `lighthouserc.json` existence** — the GitHub Actions workflow references `./lighthouserc.json` which was not found in the repository root. The CI will fail without it.

16. **Read and audit `src/lib/queues/workers.ts`** and `src/lib/agent/agentService.ts` — these files were not analyzed but likely contain production-critical background job logic.

---

*Report generated by automated codebase intelligence analysis. All claims are evidence-backed from files read during this session. Mark any claim as POSSIBLE if additional verification is needed.*
