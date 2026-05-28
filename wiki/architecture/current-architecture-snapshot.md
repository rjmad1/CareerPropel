# Current Architecture Snapshot

This document provides a compressed bootstrap context of the CareerPropel codebase architecture. Use this as the primary reference when working with the repository.

---

## Active Runtimes

1. **Web Runtime (`src/bin/web.ts`)**:
   - Manages the Next.js server (`next start`).
   - Serves pages, API routes, and accepts client SSE connections.
   - Restricts API processing to light database/queue operations.

2. **Worker Runtime (`src/bin/worker.ts`)**:
   - Powers background BullMQ jobs.
   - Spawns 1 core execution worker and 5 domain-specific workers (discovery, enrichment, outreach generation, followup, engagement tracking).
   - Handles LLM generation, processing, and long-running agent logic.

3. **Scheduler Runtime (`src/bin/scheduler.ts`)**:
   - Runs the BullMQ QueueScheduler daemon.
   - Monitors stalled tasks and promotes delayed jobs.

---

## Canonical Queues

- **Execution Queue (`executionQueue`)**: Main job pipeline.
- **Dead Letter Queue (`deadLetterQueue`)**: Captures permanently failed jobs.
- **Domain Queues**: Dedicated networking queues for distributed domain tasks.

---

## Realtime Architecture

- **Server-Sent Events (SSE)** is the canonical transport protocol.
- Web routes connect clients to `/api/agent/execution/[executionId]/subscribe`.
- A single shared subscriber (`src/lib/realtime/sharedSubscriber.ts`) multiplexes event stream data from Redis Pub/Sub channels to eliminate connection starvation.
- WebSockets (`socket.io`) are completely deprecated.

---

## Governance Enforcement

- **ast-grep**: Enforces no direct Redis instantiations outside factory/clients, and no inline AI executions on Web routes.
- **Semgrep**: Restricts web routes from importing worker internals, and prevents test modules leaking into runtime paths.
- **dependency-cruiser**: Automatically fails builds on layer violations (e.g. Web runtime importing Worker, or UI components importing infrastructure).
- **madge**: Fails CI on circular dependencies.

---

## Architectural Exceptions

1. **Bull Board**: Allowed to use Pages Router in `src/pages/api/admin/queues/[[...slug]].ts` for UI visualization.
2. **Playwright SSE Instrumentation**: Exposes connection count globally under `process.env.NODE_ENV === 'test'`.
3. **Mock LLM Provider**: Bypasses NIM/Anthropic APIs in testing if `LLM_PROVIDER === 'mock'` is set.
