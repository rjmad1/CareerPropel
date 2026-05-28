# Dependency Hotspots

This document identifies module integration points that are critical to CareerPropel's stability and lists rules to protect them from dependency leakage.

---

## 1. Database Client (`src/lib/db.ts`)
- **Role**: Re-exports the unified Prisma client instance.
- **Risk**: Direct database access in frontend components or hooks is prohibited.
- **Guardrails**: Only imported by `src/lib/db/` repositories and worker logic.

---

## 2. LLM Provider client (`src/lib/llm/provider.ts`)
- **Role**: Orchestrates Anthropic and Nvidia NIM providers.
- **Risk**: Circular dependency hazards between orchestrator and provider classes (resolved by moving shared types to `src/lib/llm/types.ts`).
- **Guardrails**: New models/providers must implement the `LLMProviderClient` interface defined in `src/lib/llm/types.ts`.

---

## 3. SSE Manager (`src/lib/realtime/sse-manager.ts`)
- **Role**: Manages active SSE event streams and connection metrics.
- **Risk**: Exposes connection metrics to Playwright tests; risks leaking test controls to production code.
- **Guardrails**: Test instrumentation must be strictly enclosed within `process.env.NODE_ENV === 'test'`.
