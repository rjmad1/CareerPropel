# Repository Index

This document maps directories, modules, and file responsibilities in the CareerPropel codebase.

---

## 1. Top-Level Directories

- [src/app/](file:///c:/Users/rajaj/CareerPropel/src/app): Next.js App Router pages and API routes.
- [src/bin/](file:///c:/Users/rajaj/CareerPropel/src/bin): Process entry points (web, background worker, scheduler daemon).
- [src/components/](file:///c:/Users/rajaj/CareerPropel/src/components): React UI components.
- [src/hooks/](file:///c:/Users/rajaj/CareerPropel/src/hooks): Custom React hooks.
- [src/lib/](file:///c:/Users/rajaj/CareerPropel/src/lib): Core business logic, governance, database repositories, LLM client wrappers, and background queues.
- [src/types/](file:///c:/Users/rajaj/CareerPropel/src/types): Shared TypeScript type declarations and agent configurations.
- [prisma/](file:///c:/Users/rajaj/CareerPropel/prisma): Database schemas (`schema.prisma`) and migration history.
- [cypress/](file:///c:/Users/rajaj/CareerPropel/cypress): End-to-end integration test suites.

---

## 2. Core Service Modules (`src/lib/`)

- [lib/agents/](file:///c:/Users/rajaj/CareerPropel/src/lib/agents): Core agent orchestrator, prompt definitions, and transaction logs.
- [lib/governance/](file:///c:/Users/rajaj/CareerPropel/src/lib/governance): Policy enforcement, prompt registry, output validation, and bounded execution scopes.
- [lib/db/](file:///c:/Users/rajaj/CareerPropel/src/lib/db): Prisma database wrappers and repositories.
- [lib/llm/](file:///c:/Users/rajaj/CareerPropel/src/lib/llm): Unified provider client orchestrating Anthropic Claude and NVIDIA NIM.
- [lib/queue/](file:///c:/Users/rajaj/CareerPropel/src/lib/queue): BullMQ job queues, concurrency locks, DLQ replayers, and workers.
- [lib/realtime/](file:///c:/Users/rajaj/CareerPropel/src/lib/realtime): Server-Sent Events (SSE) managers and shared Redis Pub/Sub subscriber.
- [lib/observability/](file:///c:/Users/rajaj/CareerPropel/src/lib/observability): Metrics collectors, failure classifiers, trace contexts, and health reporters.

---

## 3. Web API Routing Layer (`src/app/api/`)

- [api/agents/execute](file:///c:/Users/rajaj/CareerPropel/src/app/api/agents/execute): Triggers agent executions.
- [api/agent/execution/[id]/subscribe](file:///c:/Users/rajaj/CareerPropel/src/app/api/agent/execution/subscribe): Gateway for streaming execution events (SSE).
- [api/jobs](file:///c:/Users/rajaj/CareerPropel/src/app/api/jobs): Job dashboard CRUD operations.
- [api/profile](file:///c:/Users/rajaj/CareerPropel/src/app/api/profile): Profile updates and entity parsers.
- [api/ops/](file:///c:/Users/rajaj/CareerPropel/src/app/api/ops): Queue health metrics, cost analytics, and DLQ handlers.
