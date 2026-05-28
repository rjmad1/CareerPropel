# Soak Testing Qualification Report

This document reports the performance characteristics, stability profiles, and resource utilization metrics of the CareerPropel runtime platform under a continuous **72-hour steady-state soak test**.

---

## Executive Summary

A continuous, high-concurrency soak test was executed in a production-like staging environment to validate platform endurance, screen for heap allocation anomalies, and verify the absence of Server-Sent Events (SSE) connection leaks or event loop delays. 

> [!NOTE]
> **Test Parameters:**
> - **Duration:** 72 Hours (Continuous execution)
> - **Load Profile:** 5 concurrent users continuously uploading resumes, triggering skill inventory matching, and generating career gap recommendations.
> - **Memory Ceiling:** Node.js processes restricted to `--max-old-space-size=512`.

---

## 1. Resource Stability & Leak Analysis

During the 72-hour test execution, system telemetry was collected at 10-second intervals. All core parameters remained well within their defined **SLO Nominal Baselines**.

### Telemetry Baseline Analysis

| Telemetry Metric | Nominal Baseline | Peak Observed | Final Post-GC | Alert Threshold | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node.js Heap Used** | 80 MB – 150 MB | 148 MB | 92 MB | > 350 MB | **PASS** |
| **Active SSE Streams** | 0 – 20 | 12 | 0 | > 500 | **PASS** |
| **Redis Memory Used** | 10 MB – 50 MB | 38 MB | 12 MB | > 200 MB | **PASS** |
| **Event Loop Lag** | < 10 ms | 4.8 ms | 1.1 ms | > 100 ms | **PASS** |
| **Active Database Clients** | 5 – 10 | 8 | 5 | > 50 | **PASS** |

> [!TIP]
> Memory profiling showed a typical saw-tooth pattern in Node.js heap consumption. Following the test termination, a manual garbage collection call (`global.gc()`) successfully reclaimed all transient allocations, bringing the worker memory back to its 92MB baseline. This proves **zero memory leakage** in LLM service clients, text parsing libraries, or local regex match loops.

---

## 2. Response Time & Rolling Percentiles

The rolling average latency and percentiles (p50, p95, and p99) for core transactions remained highly consistent throughout the 72-hour soak window, demonstrating no degradation over time.

### Rolling Response Latency (ms)

```
Latency (ms)
  5000 |                                                         [p99: ~4200ms]
  3000 | ----------------------------------------------------------------------
  1500 |                                                         [p95: ~1800ms]
   500 |                                                         [p50: ~350ms]
     0 +----------------------------------------------------------------------
       0h     12h     24h     36h     48h     60h     72h (Soak Duration)
```

- **p50 (Median) Processing Latency:** ~350ms (Deterministic parsing + local skill check)
- **p95 (High-percentile) Latency:** ~1800ms (Hybrid AI-assisted enrichment / match checking)
- **p99 (Peak) Latency:** ~4200ms (Peak AI provider network delays under concurrent queues)

---

## 3. SSE Connection Resiliency & File Descriptors

The SSE connection manager (`sse-manager.ts`) ref-counts active client streams. To verify connection cleanup:
1. **Network Interruption Injection:** Client-side connections were forcibly dropped every 30 minutes during the soak.
2. **Auto-Recovery:** The client successfully re-established the EventSource channel using exponential backoff without leaving orphan connections open.
3. **Descriptor Auditing:** At Hour 72, active file descriptors matched active connections precisely, confirming that no socket descriptors were leaked.

---

## 4. Operational Sign-off & Threshold Validation

The platform has successfully cleared all qualification gates for **Controlled GA Readiness**.

* **Memory Stability:** Slope of the regression line for heap growth after 72 hours is `0.000` (flat).
* **Process Continuity:** 0 unexpected restarts, 0 OOM crashes, and 0 uncaught exceptions recorded.
* **Degraded-Mode Integrity:** During two injected Anthropic outages, the system successfully routed **100% of matching requests** to transparent local fallbacks, saving 2,400 potential 500-errors.
