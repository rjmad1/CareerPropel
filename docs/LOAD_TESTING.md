# Load Testing & Scale Qualification Manual

This manual details the tools and steps to execute scale qualification runs, stress tests, and spike simulations on the CareerPropel platform.

---

## 1. Stress Scenario Simulations

We qualify the platform against five distinct operational spikes:

* **10x Queue Spikes:** Simulates 200+ jobs enqueued in a single burst (representing job board import triggers).
* **Replay Storms:** Simulates 50+ concurrent admin replay actions triggered simultaneously.
* **Provider Outages:** Simulates 100% Claude sonnet API failure rates, validating fallback model performance.
* **Reconnect Storms:** Simulates 100+ active SSE clients disconnecting and reconnecting simultaneously, asserting recovery bandwidth limits.
* **Concurrent Burst Runs:** Continuous high-concurrency requests executing for 60 minutes.

---

## 2. Load Testing Execution

To run a simulated 10x queue spike qualification:
1. Ensure the staging runtimes are fully booted and clear of old metrics.
2. Launch the scale simulation harness:
   ```bash
   npx tsx src/lib/testing/load/load-simulation.ts --spike-10x --total-jobs 200
   ```
3. Monitor active queue metrics via `/api/ops/metrics` to ensure that standard workers do not lock, memory stays within boundaries, and no jobs are lost.

---

## 3. Qualification Pass Criteria

A load test is considered successful only when:
* **Zero Lost Jobs:** Every enqueued job is either processed successfully, fails gracefully with a logged classification, or routes cleanly to the DLQ.
* **Zero Orphan DB Rows:** Every active execution is fully represented in database states.
* **Heap Stability:** Worker heap memory does not exceed `512MB` or trigger OOM restarts.
* **Event Ledger Integrity:** Full hash verification passes for every active execution ledger after the run completion.
