# Chaos Testing Framework & Reliability Suite

This document describes the `ChaosFaultInjector` framework and the corresponding integration tests implemented to validate the operational resilience of CareerPropel under degraded runtime conditions.

## 1. Fault Injector Design

The `ChaosFaultInjector` (`src/lib/testing/chaos/index.ts`) allows developers to inject simulated infrastructure degradation programmatically:

*   **Redis Latency & Disconnects**: Intercepts commands on `ioredis.prototype.sendCommand` to inject arbitrary latency (e.g. 500ms delay) or reject requests completely to simulate database network cuts.
*   **Prisma Deadlocks**: Monkeypatches PrismaClient v5 internal query execution pipeline (`_request`) to throw Postgres `P2034` deadlock errors.
*   **LLM Provider Timeouts & Rate Limits**: Monkeypatches Anthropic SDK client creation (`messages.create`) to throw simulated `429` rate limit exceptions, timeout errors, or return malformed JSON payloads.
*   **Worker Duplicate Locks**: Force-fails user/agent concurrency checks to assert recovery when multiple workers contend for the same tasks.

---

## 2. Reliability Integration Tests

The reliability tests are located under `src/__tests__/reliability/` and run against actual system dependencies:

*   **`exactly-once.test.ts`**: Verifies that duplicate job processing requests do not transition execution states twice, and that the state machine prevents illegal transitions (e.g. completed tasks reverting to running).
*   **`sse-recovery.test.ts`**: Asserts that connection recovery behaves correctly, event sequences are replayed, and that reconnection storms/burst throttling trigger lockouts.
*   **`queue-integrity.test.ts`**: Verifies that tasks are routed to appropriate queue partitions based on estimated cost, retry count, and duration. Confirms DLQ promotions function correctly.
*   **`worker-recovery.test.ts`**: Validates worker recovery routines. Simulates crashed workers by creating stuck executions and runs the reconciliation loop to verify they are recovered to a failed/retryable status cleanly.
