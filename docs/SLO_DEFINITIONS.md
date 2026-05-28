# Service Level Objectives (SLOs) Manual

This manual defines the canonical Service Level Objectives (SLOs) and Service Level Indicators (SLIs) for the CareerPropel platform.

---

## 1. Service Level Indicators (SLIs) & Targets

We track seven core operational objectives in production:

| Objective | SLI Definition | Target | Target Window |
| :--- | :--- | :--- | :--- |
| **Enqueue Latency** | Time between client request and enqueue success. | **p95 < 500ms** | Rolling 24 Hours |
| **Worker Pickup Lag** | Delay between job enqueue and worker pickup. | **p95 < 5.0 seconds** | Rolling 24 Hours |
| **Replay Success Rate** | Percentage of admin replay actions that succeed. | **> 99.5%** | Monthly |
| **Worker Self-Recovery** | Duration to detect and recover a stalled BullMQ job. | **< 60 seconds** | Per Incident |
| **SSE Reconnect Lag** | Delay for client to reconnect and catch up on missed events. | **p95 < 2.0 seconds** | Rolling 24 Hours |
| **Provider Fallback Rate** | Success rate of fallback LLM promotion during outages. | **> 98.0%** | Monthly |
| **DLQ Replay Success** | Rate of successful reprocessing for DLQ replayed items. | **> 90.0%** | Monthly |

---

## 2. Telemetry Verification

SLO compliance is verified continuously by querying database metrics and log events:

* **Worker Recovery Audit:** Calculated by measuring the difference between `interruptedAt` and the subsequent successful `startedAt` timestamp in `AgentExecution` logs.
* **SSE Integrity:** Monitored by matching `lastEventId` recovery hashes in `SnapshotRecovery` schemas during reconnect requests.
* **SLO Violations Alerting:** Elevated latency or pickup failures immediately trigger severity escalations via our background alert sweeps.
