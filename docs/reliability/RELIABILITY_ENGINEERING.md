# Reliability Engineering & Operational Resilience

This document outlines the architecture, strategies, and designs implemented in Phase 3 to establish an operationally resilient and failure-tolerant distributed runtime for CareerPropel.

## 1. Queue Topology Partitioning

To prevent cascade failure and heavy tasks blocking short, lightweight executions, the single queue topology has been partitioned into 5 distinct channels:

*   **`agent-execution-high-priority`**: Short-running, highly interactive tasks (e.g. `resume-tailor`, `interview-prep`).
*   **`agent-execution-standard`**: Standard workloads (e.g. `research`, `job-match`).
*   **`agent-execution-heavy`**: Long-running, high-resource tasks, or tasks promoted due to high retry count.
*   **`agent-execution-maintenance`**: System-level administrative work.
*   **`agent-execution-dlq`**: Dead Letter Queue channel storing permanently failed or max-retried tasks for operator recovery.

### Routing Policy Matrix

Executions are routed dynamically at enqueue time via `routeQueuePartition` in `src/lib/runtime/isolation/index.ts`:

| Property / Threshold | Target Partition | Reason |
| :--- | :--- | :--- |
| `agentType: system-maintenance` | `maintenance` | Scopes background maintenance work. |
| `estimatedCost > $0.50` | `heavy` | High-cost calls run isolated in heavy workers. |
| `durationMs > 10 minutes` | `heavy` | Prevents blockages on standard queues. |
| `retryCount >= retryCeiling` | `heavy` / `dlq` | Retried or failing tasks are moved to heavy before DLQ. |
| Default | `high-priority` or `standard` | Matched dynamically using the agent policy definition. |

---

## 2. Agent Isolation Policies

Each agent executes within defined concurrency and resource envelopes (`src/lib/runtime/isolation/index.ts`):

*   **Concurrency Ceilings**: Active executions are tracked globally in Redis via unique user/agent slot sets, enforcing limits (e.g., maximum 4 concurrent `resume-tailor` processes globally).
*   **Retry policies**: Standard retry attempts are governed by exponential backoff parameters, capped strictly, preventing infinite loops.
*   **Timeouts**: Tasks are wrapped in defensive timeouts (e.g., 5m for `job-match`, 30m for `system-maintenance`) to avoid hanging worker processes.

---

## 3. SSE Isolation & Flood Protection

Realtime SSE streams are guarded against connection leaks and reconnection storms:

*   **Client Connection Ceilings**: A maximum of 5 parallel SSE connections is allowed per user. Stale/LRU connections are evicted automatically when the ceiling is reached.
*   **Replay Storm Protection**: Reconnect recovery calls (fetching buffered events using `Last-Event-ID`) are rate-limited via a sliding-window algorithm. Rapid reconnections (e.g., > 10 in 1 minute) trigger lockouts.
*   **Emission Throttling**: Event broadcast rate is capped at 30 events per second per user to prevent network saturation.
*   **Zombie Sweep**: Idle SSE connection handlers are cleaned up periodically (every 60s) from the shared subscriber map if they have been inactive for more than 5 minutes.

---

## 4. Graceful Shutdown & Worker Drain

System termination sequences are hooked (`SIGINT`/`SIGTERM`) to guarantee zero orphan states:

1.  **Stop Pickup**: Workers pause immediate queue polling via `worker.pause()`.
2.  **Drain Period**: In-flight jobs are allowed a 15-second grace window to complete.
3.  **Graceful Halt**: Redis, Prisma, and SSE connections are closed sequentially, allowing clean process exit.
