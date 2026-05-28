# Telemetry & Cost Governance (docs/orchestration/TELEMETRY.md)

This document describes how the orchestration engine instruments token counts, latency metrics, and execution costs.

---

## 1. Token Tracking & Logging

Specialized agent executions instrument token usage by storing log inputs into the `TokenUsageLog` table:
```typescript
interface TokenLog {
  candidateId: string;
  executionId: string;
  presetName: string;
  providerName: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}
```

---

## 2. Latency Metrics Collection

Every agent execution tracks duration using high-precision timers (`durationMs`) and updates the `AgentExecution` table.
*   **Heartbeat Monitor:** Active execution heartbeats are posted to Redis channels.
*   **Stall Detectors:** If an active step exceeds `averageLatencyMs * 1.5`, a stall signal is dispatched to the recovery routine.

---

## 3. Telemetry Correlation

The visual Kanban swimlanes map database telemetry metrics to dashboard views in real-time, allowing operators to visually track the active financial and latency load of in-flight agents.
