# CareerPropel — Agent System Audit

This document presents a comprehensive repository-wide inventory and audit of all agent-related executors, prompts, orchestration flows, and queue configurations in the CareerPropel codebase.

---

## 1. Agent Inventory & Current State

CareerPropel operates a hybrid AI execution model consisting of **Phase 2 LLM Agents** (fully parameterized, governed, and structured) and **Scraping/Enrichment Workers** (networking/domain-specific).

### Active Phase 2 LLM Agents (Managed by `executeAgent`)

| Agent ID | Purpose | Target Model | Status / Health |
|---|---|---|---|
| `resume-tailor` | ATS-specific resume optimization | Claude 3.5 Sonnet / Gemini | Active / Healthy |
| `job-match` | Multi-dimensional candidate alignment scoring | Claude 3.5 Sonnet / Gemini | Active / Healthy |
| `interview-prep` | Comprehensive STAR story and prep generation | Claude 3.5 Sonnet | Active / Healthy |
| `research` | Company-specific operational and cultural intel | Claude 3.5 Sonnet | Active / Healthy |
| `follow-up` | Context-aware outreach and email follow-up generation | Claude 3.5 Sonnet | Active / Healthy |
| `networking` | Prioritized networking and warm outreach strategy | Claude 3.5 Sonnet | Active / Healthy |
| `role-intelligence` | Job description deconstruction & archetype mapping | Claude 3.5 Sonnet | Active / Healthy |
| `fit-analysis` | Translation of candidate history into employer language | Claude 3.5 Sonnet | Active / Healthy |
| `strength-mapper` | Mapping candidate accomplishments to target bottlenecks | Claude 3.5 Sonnet | Active / Healthy |
| `conversion-scorer` | 10-dimension fit and interview probability scoring | Claude 3.5 Sonnet | Active / Healthy |
| `gap-analyzer` | Trainable/domain/credibility gap identification | Claude 3.5 Sonnet | Active / Healthy |
| `pattern-miner` | Success-correlation pattern mining from matches | Claude 3.5 Sonnet | Active / Healthy |

### Networking & Scraping Operations (Event Telemetry only)

*   `linkedin-profile`: Imports candidate profile from LinkedIn (Scraping worker, non-LLM).
*   `linkedin-search`: Performs network searching for warm contacts (Scraping worker, non-LLM).
*   `indeed-search`: Pulls job postings from Indeed (Scraping worker, non-LLM).

---

## 2. Runtime & Lifecycle Ownership

*   **Runtime Ownership**:
    *   **Worker Runtime (`src/bin/worker.ts`)**: Consumes tasks from `executionQueue` via BullMQ, builds context using `src/lib/agents/contextBuilder.ts`, and invokes `executeAgent` inside `src/lib/agents/executor.ts`.
    *   **Web Runtime (`src/bin/web.ts`)**: Restricts API calls to light operations (pausing, resuming, or cancelling executions). Spawns SSE streams to stream task updates to clients.
*   **Agent Lifecycle**:
    *   Currently, executions are mapped across five database states: `idle` | `queued` | `running` | `paused` | `completed` | `failed`.
    *   Telemetry mapping in `src/lib/agents/redis-integration.ts` maps status changes to frontend-friendly SSE payloads.

---

## 3. Dependencies & Telemetry Integration

*   **Database**: PostgreSQL via Prisma (`prisma.agentExecution`, `prisma.eventLog`, `prisma.toolCall`).
*   **Message Broker**: Redis via `ioredis` (Pub/Sub for SSE events, BullMQ queues for async orchestration).
*   **LLM Provider**: Decoupled through `src/lib/llm/provider.ts` supporting Anthropic and Nvidia NIM, with dynamic failover circuits.
*   **Telemetry**: Execution metrics, latency, token consumption, and failure classifications are recorded in `prisma.agentExecution` and logged via Pinot.

---

## 4. Audited Anomalies & Deprecation Candidates

*   **Mock LLM provider**: Located in `src/lib/llm/provider.ts`. Only enabled when `process.env.LLM_PROVIDER === 'mock'` and in a test environment. Gated strictly to avoid leakage into production.
*   **Historical Socket.IO paths**: Legacy paths and server hooks (`src/hooks/useSocket.ts`, `src/lib/socket/`) have been completely deleted to enforce the Server-Sent Events (SSE) standard.
*   **Orphaned abstractions**: `src/lib/agent/` contains `agentService.ts` which is client-facing. It is isolated from server-side modules but has a duplicate naming structure (`src/lib/agent` vs `src/lib/agents`). Consolidating this will resolve naming collisions.
