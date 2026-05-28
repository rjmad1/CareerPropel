# Capacity Engineering & Queue Sizing Manual

This document details the capacity modeling, resource tracking, and infrastructure scaling parameters for the CareerPropel distributed runtime.

---

## 1. Resource Saturation Metrics

To monitor system capacity, we evaluate three primary indicators:

* **Redis Queue Saturation Ratio:** Calculated as `Active Workers / Max Queue Concurrency`. A ratio of `1.0` indicates complete worker saturation.
* **Database Ledger Growth:** Number of transactions written to `ExecutionEventLedger` per hour.
* **Provider Concurrency Ratio:** Current concurrent LLM calls divided by the maximum provider rate limit.

---

## 2. Queue Throughput & Memory Projections

* **Throughput Target:** The platform is configured to sustain up to 100 concurrent executions per minute.
* **Redis Memory Consumption:** Standard BullMQ jobs average 2KB – 5KB in payload size. A waiting queue of 500 jobs consumes less than 2.5MB in Redis cache memory, maintaining extremely low memory footprint.
* **PostgreSQL Capacity:** A full agent run generates 6–10 event ledger entries. At 1,000 runs per day, PostgreSQL accumulates 10,000 rows daily (~15MB of storage). The autonomous **warm compression** and **archiving** sweeps keep the active database size steady below 10GB.

---

## 3. Host Sizing & Scaling Recommendations

We enforce strict vertical and horizontal sizing parameters for our operational nodes:

| Cluster Role | CPU | RAM (Minimum) | Scaling Trigger (Horizontal) |
| :--- | :--- | :--- | :--- |
| **WebApp Node** | 1 vCPU | 2 GB | CPU > 75% OR active SSE streams > 200 |
| **Worker Node** | 2 vCPU | 4 GB | Saturation Ratio > 70% for 5 minutes |
| **Redis Instance** | 1 vCPU | 1 GB | Memory Used > 800 MB |
| **PostgreSQL DB** | 2 vCPU | 4 GB | Connection pool usage > 80% |
