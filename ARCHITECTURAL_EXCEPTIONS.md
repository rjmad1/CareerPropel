# CareerPropel — Architectural Exceptions Registry

This document lists all approved exceptions to the core architecture rules, details their boundaries, and describes rules preventing their expansion.

---

## Exception 1 — Bull Board Pages Router

- **Purpose**: Exposes the BullMQ admin UI interface (Bull Board) for queue visualization and management.
- **Compatibility Reason**: Bull Board uses Express-like routing which maps seamlessly to Next.js Pages Router API handlers, but is not natively supported directly within Next.js App Router route handlers without complex adapter layers.
- **Scope Boundary**: Restricted to `src/pages/api/admin/queues/[[...slug]].ts`.
- **Expansion Prohibition**: No other Pages Router routes or custom API handlers are allowed. All application feature development and API endpoints must use the App Router (`src/app/`).
- **GOVERNANCE Comment Block**:
  ```ts
  // GOVERNANCE:
  /**
   * GOVERNANCE: Pages Router used ONLY for Bull Board compatibility.
   * App Router remains canonical.
   * Do not expand Pages Router usage.
   */
  ```

---

## Exception 2 — Playwright SSE Instrumentation

- **Purpose**: Enables E2E automated tests (using Playwright) to verify that client-side EventSource instances are ref-counted and deduplicated correctly.
- **Isolation Guarantees**: Gated strictly with `process.env.NODE_ENV === 'test'`.
- **Prohibition against Production Dependency**: This global window attribute (`(window as any).__sse_manager_connections_count`) is dead-code eliminated (tree-shaken) from production bundles. Production code must never read from or rely on this property.
- **GOVERNANCE Comment Block**:
  ```ts
  // GOVERNANCE:
  /**
   * GOVERNANCE: Playwright SSE connections count instrumentation global.
   * Only exposed during test runs, wrapped in NODE_ENV === 'test' so it is tree-shaken
   * and dead-code eliminated from production bundles.
   */
  ```

---

## Exception 3 — Mock LLM Provider

- **Purpose**: Bypasses third-party AI provider calls (Anthropic, Nvidia NIM) in automated test runs and local validation to speed up runs and save API credits.
- **Activation Restrictions**: Only allowed when `process.env.LLM_PROVIDER === 'mock'` AND both `process.env.NODE_ENV === 'test'` and `process.env.ENABLE_TEST_LLM_MOCKS === 'true'` are set.
- **Production Prohibition**: Attempts to use the mock provider outside test mode throws a hard, descriptive error during startup, failing the runtime immediately to prevent accidental leakages.
- **GOVERNANCE Comment Block**:
  ```ts
  // GOVERNANCE:
  /**
   * GOVERNANCE: Mock LLM provider may only be activated in test environments.
   * Requires NODE_ENV === "test" AND ENABLE_TEST_LLM_MOCKS === "true".
   * Otherwise an explicit error is thrown to prevent production leakage.
   */
  ```

---

## Exception 4 — Remaining Compatibility Runtime Files

- **File**: `src/hooks/useRealTime.ts`
  - **Why Retained**: Acts as a stub hook to preserve historical call-sites from components that previously subscribed to legacy WebSockets. Prevents component compilation failures or unhandled runtime execution faults.
  - **Deprecation Path**: Gradually replace usages of `useRealTime` with `useAgentExecution` (using SSE) in all UI components.
  - **Removal Conditions**: Remove once all references (e.g. in `AgentRail`, `KanbanBoard`, `InterviewPrepWorkspace`) are refactored to SSE.
  - **GOVERNANCE Comment Block**:
    ```ts
    // GOVERNANCE:
    /**
     * GOVERNANCE: Legacy WebSocket stub hook.
     * Connected indicator is forced to true ONLY in test environments.
     * Must remain false in production to prevent fake connection status.
     */
    ```

---

## Exception 5 — LLM Provider Circular Dependency Registry

- **Components Involved**: 
  - `src/lib/llm/provider.ts` ↔ `src/lib/llm/anthropic.ts`
  - `src/lib/llm/provider.ts` ↔ `src/lib/llm/nvidia-nim.ts`
- **Import Graph Analysis**:
  - `provider.ts` acts as the orchestrator and imports concrete provider classes (`AnthropicProvider` and `NvidiaNimProvider`) to instantiate them based on the active environment configuration.
  - Concrete provider implementations (`anthropic.ts`, `nvidia-nim.ts`) import the abstract types/interfaces (`LLMMessage`, `LLMCallOptions`, `LLMCallResult`, `LLMProviderClient`) declared in `provider.ts` to satisfy interface constraints.
- **Immediate Risk Level**: **LOW**. Since the circular references only involve TypeScript type declarations (interfaces and types), they are erased during compilation. They do not trigger runtime cyclic initialization errors.
- **Remediation Strategy**:
  - Move all shared types and client interfaces into a new standalone type file: `src/lib/llm/types.ts`.
  - Update `provider.ts`, `anthropic.ts`, and `nvidia-nim.ts` to import from the new `./types` module.
- **Recommended Future Cleanup Sequence**:
  - Task 1: Create `src/lib/llm/types.ts` and export the types.
  - Task 2: Refactor type imports in concrete classes.
  - Task 3: Refactor type imports in `provider.ts` and verify build status.
  - *Note: To avoid unnecessary runtime churn, this decoupling is scheduled for a future development cycle and is not executed in this stabilization pass.*

