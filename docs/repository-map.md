# Repository Map

## Purpose

Canonical directory structure reference. Describes module ownership and file responsibilities.

## Top-Level Layout

```
CareerPropel/
├── src/
│   ├── app/             # Next.js App Router pages and API routes
│   ├── bin/             # Process entry points (web, worker, scheduler)
│   ├── components/      # React UI components
│   ├── domains/         # Domain-layer aggregates (thin re-exports)
│   ├── hooks/           # React custom hooks
│   ├── lib/             # Core business logic and infrastructure
│   └── types/           # Shared TypeScript types
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # SQL migration history
├── cypress/             # E2E test suite (Playwright/Cypress)
├── scripts/             # Dev/ops utility scripts
├── docs/                # Developer documentation (this directory)
└── wiki/                # Architecture wiki
```

## `src/app/` — API Routes

| Path | Methods | Purpose |
|---|---|---|
| `/api/agents/execute` | POST, GET | Enqueue agent execution; poll status |
| `/api/agent/execution/[id]` | GET | Fetch execution envelope (with tools + logs) |
| `/api/agent/execution/[id]/subscribe` | GET (SSE) | Real-time execution stream |
| `/api/agent/execution/[id]/cancel` | POST | Cancel running execution |
| `/api/agent/execution/[id]/pause` | POST | Pause execution |
| `/api/agent/execution/[id]/resume` | POST | Resume paused execution |
| `/api/agent/execution/[id]/logs` | GET | Paginated event logs |
| `/api/jobs` | GET, POST | Job board CRUD |
| `/api/jobs/[id]` | GET, PUT, DELETE | Single job operations |
| `/api/profile` | GET, PUT | User profile |
| `/api/profile/completeness` | GET | Profile completeness score |
| `/api/profile/entities` | GET | Extracted profile entities |
| `/api/profile/recommendations` | GET | AI recommendations |
| `/api/interviews` | GET, POST | Interview records |
| `/api/interview-prep/[jobId]/generate` | POST | Generate interview prep |
| `/api/documents` | GET, POST | Document management |
| `/api/offers` | GET, POST | Job offer tracking |
| `/api/audit-logs` | GET | Audit log query |
| `/api/ops/metrics` | GET | Operational metrics snapshot |
| `/api/ops/queue` | GET | Queue job counts |
| `/api/ops/dlq` | GET | Dead-letter queue inspection |
| `/api/ops/dlq/replay` | POST | Replay DLQ jobs |
| `/api/ops/providers` | GET | Provider health reports |
| `/api/ops/executions` | GET | Execution history query |
| `/api/ops/cost` | GET | Cost analytics |
| `/api/ops/alerts` | GET | Active operational alerts |
| `/api/auth/2fa/setup` | POST | 2FA setup (TOTP) |
| `/api/auth/2fa/enable` | POST | Enable 2FA |
| `/api/admin/users` | GET | Admin user management |
| `/api/admin/threats` | GET | Security threat log |
| `/api/api-keys` | GET, POST | API key management |
| `/health` | GET | Liveness probe |
| `/ready` | GET | Readiness probe |
| `/live` | GET (SSE) | Global real-time feed |

## `src/bin/` — Process Entry Points

| File | Purpose |
|---|---|
| `web.ts` | Spawns `next start` with graceful shutdown hooks |
| `worker.ts` | Starts BullMQ execution worker |
| `scheduler.ts` | Starts queue scheduler and cleanup daemon |

## `src/lib/` — Core Library

| Directory | Responsibility |
|---|---|
| `lib/agent/` | API client helpers for agent operations (frontend) |
| `lib/agents/` | Agent executor, prompt definitions, execution store |
| `lib/analytics/` | CSV/JSON export utilities |
| `lib/db/` | Typed Prisma repository functions |
| `lib/errors/` | `ApiError` class and standard error codes |
| `lib/governance/` | Policy engine, prompt registry, output validation, hallucination controls, bounded execution, multi-agent coordination |
| `lib/interview/` | Interview prep generator and prep service |
| `lib/llm/` | Anthropic SDK wrapper |
| `lib/logging/` | Pino logger factory; audit log |
| `lib/middleware/` | Auth middleware, rate limiter |
| `lib/notifications/` | Notification dispatcher |
| `lib/observability/` | Metrics, tracing, cost analytics, failure classification, provider health, replay |
| `lib/profile/` | Profile service and entity extraction |
| `lib/queue/` | BullMQ queue definitions, workers, scheduler, concurrency, dead-letter, retry policy, events, payload |
| `lib/queues/` | Legacy queue namespace (thin wrapper) |
| `lib/realtime/` | SSE broadcaster and shared subscriber |
| `lib/redis/` | Redis client factory |
| `lib/runtime/` | Settings (env), shutdown handler |
| `lib/safety/` | Input safety checks |
| `lib/security/` | API key management, 2FA (TOTP) |
| `lib/socket/` | Socket.io server (legacy; SSE is primary) |
| `lib/utils/` | Shared utility functions |
| `lib/validation/` | Zod schema validators |

## `src/components/` — UI Components

| Directory | Purpose |
|---|---|
| `Agent/` | Agent execution timeline, log, rail, card |
| `CareerOS/` | Integrated dashboard shell |
| `InterviewPrep/` | Interview prep workspace (7 tabs) |
| `Kanban/` | Kanban board, cards, swimlanes |
| `Layout/` | App layout wrapper |
| `Notifications/` | Toast and notification center |
| `Profile/` | Profile editor, completeness, skill matrix |
| `analytics/` | Export buttons |
| `forms/` | Form components |
| `ui/` | Primitive UI components |

## `prisma/` — Database

| File | Purpose |
|---|---|
| `schema.prisma` | Prisma model definitions |
| `migrations/20260524000000_runtime_modernization/` | AgentExecution, ToolCall, EventLog tables |
| `migrations/20260525000000_ai_governance_phase1/` | PromptVersion table; provenance fields on AgentExecution |

## Last Updated
2026-05-27
