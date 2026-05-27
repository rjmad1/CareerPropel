# System Overview

## Purpose

High-level architectural description of CareerPropel — an AI-native career management platform. Describes runtime boundaries, data flows, and key design decisions.

## System Description

CareerPropel automates job-search workflows using AI agents. Users manage a Kanban job pipeline, trigger AI agents for specific tasks (resume tailoring, interview prep, company research), and receive results via real-time streaming.

## Runtime Topology

```
┌─────────────────────────────────────────────────┐
│                   User Browser                   │
│   (React / MUI / Zustand / EventSource SSE)      │
└────────────────────┬────────────────────────────┘
                     │ HTTP + SSE
┌────────────────────▼────────────────────────────┐
│              Web Process (Next.js 14)            │
│   App Router · API Routes · SSE Endpoint         │
│   Auth: NextAuth v4 · 2FA: TOTP/speakeasy        │
└────────────┬────────────────────┬───────────────┘
             │ Prisma ORM          │ BullMQ enqueue
┌────────────▼──────┐  ┌──────────▼───────────────┐
│   PostgreSQL DB   │  │    Redis (BullMQ)          │
│  (persistent)     │  │    agent-execution queue   │
└───────────────────┘  └──────────┬───────────────┘
                                  │ dequeue
┌─────────────────────────────────▼───────────────┐
│              Worker Process (BullMQ)             │
│   executeAgent() → Anthropic SDK → Claude API    │
│   Governance: policy check → validation →        │
│               hallucination scan → persist        │
│   Realtime: Redis pub → SSE subscriber           │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│            Scheduler Process (BullMQ)            │
│   Stale execution cleanup · DLQ sweep            │
└─────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### 1. Three-Process Separation
Web, Worker, and Scheduler run as independent processes. This isolates CPU-heavy AI work from request handling. Each registers graceful shutdown via `src/lib/runtime/shutdown.ts`.

### 2. SSE as Canonical Real-Time Transport
WebSocket was removed (commit `8754c84`). Server-Sent Events (SSE) are the sole real-time channel. Clients connect to `/api/agent/execution/[id]/subscribe`. Events are published from the worker via Redis pub/sub and forwarded to SSE streams by `src/lib/realtime/sharedSubscriber.ts`.

### 3. BullMQ for Execution Isolation
All agent executions are queued via BullMQ (`agent-execution` queue). The worker processes them with:
- Redis-backed concurrency slots per user/agent-type
- Exponential backoff retries (up to 4 attempts)
- Dead-letter queue for permanently failed jobs
- Stall detection and requeue

### 4. Governance as Mandatory Execution Gates
Every agent execution passes through a layered governance pipeline (see [Governance Layer](../components/governance.md)):
1. Policy check (token budget, cost, concurrency, allowed tools)
2. Prompt version resolution (from `PromptVersion` DB table)
3. Output schema validation (Zod)
4. Semantic validation (heuristic rules)
5. Hallucination inspection (pattern matching)
6. Output normalization

### 5. PostgreSQL as Single Source of Truth
All execution state (`AgentExecution`, `ToolCall`, `EventLog`) is persisted in PostgreSQL. Redis is ephemeral — used only for queue transport and pub/sub. Execution can be reconstructed from DB.

## Data Flow — Agent Execution

```
POST /api/agents/execute
  → create AgentExecution (status=queued)
  → enqueueExecution() → BullMQ
  → publishRealtimeEvent(queued)
  → return { executionId, status: queued }

Worker picks up job:
  → acquireExecutionSlots()
  → update AgentExecution (queueJobId, attempts)
  → publishRealtimeEvent(started)
  → executeAgent()
      → getActivePromptVersion()
      → checkExecutionPolicy()
      → call Anthropic Claude API
      → validateAgentOutput()
      → inspectForHallucinations()
      → persist output to AgentExecution
  → publishRealtimeEvent(completed|failed)
  → releaseExecutionSlots()

Client SSE stream:
  → subscribeToExecution()
  → receives: execution:update, log:new, toolcall:complete, heartbeat
```

## Bounded Contexts

| Context | Description |
|---|---|
| **Job Pipeline** | Kanban board, job CRUD, status tracking |
| **Agent Execution** | AI task queue, lifecycle management, real-time streaming |
| **Governance** | Policy enforcement, prompt versioning, output safety |
| **Profile** | User career data, completeness scoring, entity extraction |
| **Interview Prep** | Prep generation, behavioral stories, company research |
| **Observability** | Metrics, tracing, cost analytics, provider health |
| **Security** | Auth, 2FA, API keys, audit logs |

## Dependencies

- `@anthropic-ai/sdk` — LLM provider
- `bullmq` + `ioredis` — queue infrastructure
- `@prisma/client` — database ORM
- `next-auth` — authentication
- `zod` — runtime validation
- `pino` — structured logging
- `next` — web framework

## Related

- [Module Index](module-index.md)
- [Runtime Flow](runtime-flow.md)
- [Deployment Topology](deployment-topology.md)
- [Agent System](../components/agent-system.md)

## Last Updated
2026-05-27
