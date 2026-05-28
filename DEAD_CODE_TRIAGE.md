# CareerPropel — Dead Code Triage & Cleanup Decisions

This document triages the major Knip findings into actionable decisions: **DELETE**, **ARCHIVE**, **RETAIN**, **FUTURE FEATURE**, or **UNKNOWN**. Deletion candidates are prioritized first, and runtime-affecting components are prioritized over UI-only components.

---

## 1. Deletion Candidates (DELETE)
*High priority. Unused files and packages that increase bundle size or runtime surface area.*

| File / Dependency | Category | Rationale | Owner / Action |
|---|---|---|---|
| `src/hooks/useSocket.ts` | **Runtime (Socket Client)** | WebSocket client hook. The WebSocket protocol has been removed; client communication has migrated fully to SSE. | **DELETED (Resolved)** |
| `src/lib/socket/server.ts` | **Runtime (Socket Server)** | WebSocket initialization and event handling. Unused by the active HTTP server. | **DELETED (Resolved)** |
| `src/lib/socket/auth.ts` | **Runtime (Socket Auth)** | WebSocket session checking and middleware helpers. | **DELETED (Resolved)** |
| `socket.io` | **Dependency** | Unused package.json dependency since WebSocket transport decommission. | **DELETED (Resolved)** |
| `socket.io-client` | **Dependency** | Unused package.json dependency. | **DELETED (Resolved)** |
| `src/lib/realtime/agentStatusBroadcaster.ts` | **Runtime (Realtime)** | Stub for broadcasting agent status to WebSocket clients. Fully superceded by `sharedSubscriber.ts` and Next.js SSE routes. | **DELETED (Resolved)** |
| `src/lib/workflow/scheduler.ts` | **Runtime (Workflow Queue)** | Legacy/unused workflow queue scheduler. Superceded by BullMQ orchestration queue scheduler (`src/lib/queue/scheduler.ts`). | **DELETED (Resolved)** |
| `src/lib/workflow/worker.ts` | **Runtime (Workflow Queue)** | Legacy/unused workflow worker implementation. Superceded by BullMQ execution workers (`src/lib/queue/workers.ts`). | **DELETED (Resolved)** |

---

## 2. Archive Candidates (ARCHIVE)
*Unused code that is helpful for local diagnostics or references, to be moved to archives.*

| File / Component | Category | Rationale | Owner / Action |
|---|---|---|---|
| `src/lib/governance/regressionHarness.ts` | **Observability** | Testing harness for agent regression testing. Not used in active production paths. | **ARCHIVE** to `ArchiveDocumentation_CareerPropel/` |
| `src/lib/governance/boundedExecution.ts` | **Orchestration** | Experimental bounded execution layer. | **ARCHIVE** |
| `src/lib/governance/multiAgentCoordination.ts` | **Orchestration** | Reference implementation of multi-agent coordination. | **ARCHIVE** |

---

## 3. Retained Code (RETAIN)
*Unused exports or files that are intentionally exported/preserved for telemetry, hooks integration, or future expansion.*

| Symbol / File | Category | Rationale | Owner / Action |
|---|---|---|---|
| `streamLLM` (in `src/lib/llm/provider.ts`) | **Runtime (LLM)** | Primary LLM streaming interface. Intended for use in future stream-supported API endpoints. | **RETAIN** (API integration pending) |
| `getWorkerHeartbeat` (in `src/lib/queue/workers.ts`) | **Telemetry** | Exposes metrics for queue health checks and monitoring. | **RETAIN** (Observability health check) |
| `clearIdempotency` (in `src/lib/queue/idempotency.ts`) | **Infrastructure** | Allows clearing Redis idempotency keys during manual recovery/debugging. | **RETAIN** (Ops utility) |
| `src/__tests__/` (various) | **Tests** | Unused integration tests reported by Knip because they are not imported in production paths. | **RETAIN** (Test suite) |
```
