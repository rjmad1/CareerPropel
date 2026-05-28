# Soak Testing Protocol

This document outlines the strategy and metrics for executing 24- to 72-hour long-running soak tests to identify memory leaks, resource drift, and connection exhaustion in the CareerPropel runtime environment.

---

## 1. Objectives & Focus Areas

Short-term load tests are excellent for finding spikes, but they miss slow-growth degradation. Soak testing runs the application under a steady, moderate load for extended durations (24–72 hours) to expose:

* **Memory Leaks:** Heap memory usage growing continuously without GC recovery (especially in worker isolate loops and LLM provider connections).
* **SSE Connection Leaks:** Server-Sent Events (SSE) connections staying open or failing to close, causing file descriptor exhaustion.
* **Redis Buffer Growth:** Redis queue metrics or real-time event logs accumulating without limits or expiration keys.
* **Event Loop Lag:** Slowly growing execution blockages on the Node.js event loop due to synchronous file writes or unoptimized CPU operations.

---

## 2. Test Configuration & Execution

### A. Environment Preparation
1. Configure memory limits on the Node.js processes to catch memory leaks faster:
   ```bash
   NODE_OPTIONS="--max-old-space-size=512" npm run start:worker
   ```
2. Set the log level to `info` to reduce console writing bottlenecks.

### B. Steady-State Workload Generation
Use the soak test generator to maintain a steady stream of executions:
```bash
# Simulates 5 concurrent users trigger executions continuously for 24 hours
npx tsx scripts/testing/run-soak-load.ts --duration-hours 24 --concurrent-users 5
```

---

## 3. Metrics Tracking & Sizing Limits

We monitor five telemetry indicators continuously during the soak duration:

| Metric | Nominal Baseline | Alert Threshold | Critical Failure |
| :--- | :--- | :--- | :--- |
| **Node.js Heap Used** | 80MB – 150MB | > 350MB (steady climb) | OOM Crash / Process exit |
| **Active SSE Connections** | Ref-counted based on active clients | > 500 active without clients | File descriptor exhaustion |
| **Redis Memory Used** | 10MB – 50MB | > 200MB | Redis memory exhaustion |
| **Event Loop Lag** | < 10ms | > 100ms | Severe system latency / blockages |
| **Active Event Ledger Records** | Maintained by lifecycle sweep | > 1,000,000 uncompressed | Database table bloat |

---

## 4. Soak Test Audit Procedure

At the conclusion of the 24- or 72-hour test run:
1. **Analyze Memory Slope:** The heap memory graph must return to its baseline (or remain flat) after the load is stopped and the Node.js garbage collector is manually triggered:
   ```typescript
   global.gc && global.gc();
   ```
2. **Audit Redis Keys:** Ensure all temporary `heartbeat:*` or `queue:slots:*` keys have expired and been cleaned up completely.
3. **Verify Event Ledger Sweep:** Confirm that the Scheduler's event ledger lifecycle policy successfully compressed WARM events, archived older entries to files, and purged expired events from PostgreSQL.
