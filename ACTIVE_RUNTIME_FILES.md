# CareerPropel — Active Runtime Files & Canonical Ownership

This document establishes definitive runtime ownership and eliminates ambiguity regarding active runtime entries, legacy files, and architectural boundaries in the CareerPropel codebase.

---

## Canonical Runtime Entrypoints

The application has three canonical runtime entrypoints located under `src/bin/`:

### 1. `src/bin/web.ts`
- **Runtime Responsibility**: Spawns and manages the Next.js production web server (`next start`).
- **Startup Ownership**: Main web server manager. It handles graceful shutdown signals and delegates requests to Next.js routes.
- **Queue Ownership**: None directly (delegates asynchronous job queueing to API handlers).
- **Realtime Ownership**: Handles incoming client Server-Sent Events (SSE) connections through Next.js Pages and App router routes.
- **Deployment Target**: Vercel Serverless, AWS ECS, or VM instance running Node.js.

### 2. `src/bin/worker.ts`
- **Runtime Responsibility**: Powers the background BullMQ orchestration system. Spawns one main `executionWorker` and 5 networking domain workers (discovery, enrichment, outreach generation, followup, engagement tracking).
- **Startup Ownership**: Main worker manager that loads Sentry telemetry and binds graceful shutdown hooks to close all 6 active worker processes.
- **Queue Ownership**: Full consumer ownership. Pulls and processes tasks from the primary execution queue and domain queues.
- **Realtime Ownership**: Publishes task state transitions, progress updates, and completion/failure logs to Redis pub/sub channels.
- **Deployment Target**: Persistent Node.js VM, AWS ECS task, or containerized background worker environment.

### 3. `src/bin/scheduler.ts`
- **Runtime Responsibility**: Starts the BullMQ queue scheduler daemon.
- **Startup Ownership**: Scheduler process manager. Runs the BullMQ QueueScheduler to transition delayed jobs, clean up completed/failed logs, and monitor stalled tasks.
- **Queue Ownership**: Handles internal BullMQ queue state transitions (moving jobs from delayed/stalled states to active/waiting queues).
- **Realtime Ownership**: None directly.
- **Deployment Target**: VM or background container task.

---

## Canonical Queue Files

The definitive files governing queue actions are located under `src/lib/queue/`:

| File | Status | Description |
|---|---|---|
| `src/lib/queue/queues.ts` | **ACTIVE** | Defines `executionQueue`, `deadLetterQueue`, and `getExecutionQueue()`. |
| `src/lib/queue/scheduler.ts` | **ACTIVE** | Implements the QueueScheduler daemon loops and state managers. |
| `src/lib/queue/idempotency.ts` | **ACTIVE** | Prevents duplicate processing requests using Redis-backed locks. |
| `src/lib/queue/workers.ts` | **ACTIVE** | Implements the BullMQ workers, job event listeners, and DLQ promotion. |
| `src/lib/queue/concurrency.ts` | **ACTIVE** | Implements user-level and agent-level concurrency locking using Redis. |
| `src/lib/queue/retry-policy.ts` | **ACTIVE** | Defines retry strategies, backoffs, and non-retryable errors. |
| `src/lib/queue/payload.ts` | **ACTIVE** | Validates and measures JSON payload bytes before queue entry. |
| `src/lib/queue/events.ts` | **ACTIVE** | Implements event dispatchers. |
| `src/lib/queue/health.ts` | **ACTIVE** | Monitors queue counts and worker heartbeats. |
| `src/lib/queue/dead-letter.ts` | **ACTIVE** | Implements DLQ management. |
| `src/lib/queue/enqueue.ts` | **ACTIVE** | Enqueues jobs and formats payload wrappers. |

---

## Deprecated / Historical Runtime Files

The following files are audited and classified to prevent code contamination and future architectural drift:

- `src/lib/queue/workers.ts`
  - **Classification**: **ACTIVE**. It is explicitly imported by `src/bin/worker.ts` to spin up the execution worker.
- `src/hooks/useSocket.ts`
  - **Classification**: **DELETED**. Contains client-side WebSocket hooks.
- `src/lib/socket/server.ts`
  - **Classification**: **DELETED**. Contains unused socket.io server handlers.
- `src/lib/socket/auth.ts`
  - **Classification**: **DELETED**. Contains helper methods for the socket.io authentication middleware.
- `src/lib/workflow/worker.ts`
  - **Classification**: **DELETED**. Legacy workflow step worker. Superseded by BullMQ execution workers.
- `src/lib/workflow/scheduler.ts`
  - **Classification**: **DELETED**. Legacy workflow scheduler. Superseded by BullMQ queue scheduler.
- `ArchiveDocumentation_CareerPropel/scratch/`
  - **Classification**: **ARCHIVE CANDIDATE**. Contains database and queue validation scripts. Relocated outside the runtime tree to prevent runtime execution contamination.

---

## Canonical Realtime Architecture

1. **SSE as Canonical Transport**: Server-Sent Events (EventSource) is the single canonical protocol for streaming live agent execution metrics and updates.
2. **Redis Pub/Sub Shared Subscriber Model**: Client connections route to Next.js API route streams. These streams subscribe to Redis pub/sub channels. Redis broadcasts execution status updates.
3. **Prohibition against Per-Client Redis Subscriptions**: Per-client Redis connections are strictly prohibited to avoid connection starvation. Instead, `src/lib/realtime/sharedSubscriber.ts` maintains a single shared connection per Next.js server instance and multiplexes events to active client streams.
4. **WebSocket Deprecations**: The WebSocket protocol (`/api/ws`, `/api/agents/ws`) is fully deprecated. All legacy socket.io and websocket server pathways are deactivated.
5. **SSE Ownership Boundaries**: SSE connections terminate at `/api/agent/execution/[executionId]/subscribe`. Client-side subscription tracking is fanned out through `src/lib/realtime/sse-manager.ts`.

---

## Architectural Exceptions

The following three design exceptions are explicitly registered:

### 1. Bull Board Pages Router Exception
- **Exception Reason**: BullMQ dashboard UI (Bull Board) is built on top of Express/Next.js Pages Router API handlers.
- **Scope Boundary**: Confined strictly to `src/pages/api/admin/queues/[[...slug]].ts`.
- **Expansion Prohibition**: Do not add new Pages Router handlers or routes. App Router remains the canonical project routing model.

### 2. Playwright SSE Instrumentation
- **Exception Reason**: Exposes `window.__sse_manager_connections_count` to Playwright tests for validating SSE subscription deduplication.
- **Scope Boundary**: Managed in `src/lib/realtime/sse-manager.ts` and gated under `process.env.NODE_ENV === 'test'`.
- **Expansion Prohibition**: This global is restricted to test environments and will be stripped/tree-shaken from production builds. It must never affect production execution branching.

### 3. Mock LLM Provider
- **Exception Reason**: Allows running smoke tests and local integration validation without calling Anthropic or Nvidia NIM APIs.
- **Scope Boundary**: Managed in `src/lib/llm/provider.ts` and enabled only when `process.env.LLM_PROVIDER === 'mock'`.
- **Expansion Prohibition**: Mock execution throws a hard error in production and staging if `NODE_ENV !== 'test'` or `ENABLE_TEST_LLM_MOCKS !== 'true'`.
