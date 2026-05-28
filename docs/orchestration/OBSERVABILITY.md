# Observability Dashboard (docs/orchestration/OBSERVABILITY.md)

This document defines the interface layouts and real-time visualization mechanics for the orchestration swimlanes.

---

## 1. Glass Cockpit Telemetry Layout

The visual interface is embedded inside the existing AI operations dashboard page (`src/app/observability/workflows/page.tsx`), showing real-time operational status.

```
+---------------------------------------------------------------------------------------------------------------+
|  [ AI OPERATIONS COMMAND CENTER ]                                                   Budget: $14.50 / $50.00   |
+---------------------------------------------------------------------------------------------------------------+
|  ( INTAKE )    ( PLANNING )    ( BACKLOG )     ( IN PROGRESS )    ( BLOCKED )     ( AWAITING APPROVAL )       |
|  +--------+    +--------+      +--------+      +--------+         +--------+      +--------+                  |
|  | Card A |    | Card B |      | Card C |      | Card D |         | Card E |      | Card F |                  |
|  | $0.02  |    | $0.05  |      | $0.12  |      | $0.45  | [!]     | $0.78  |      | $1.15  |                  |
|  | 0%     |    | 12%    |      | 0%     |      | 65%    | [42%]   | 80%    |      | 90%    |                  |
|  +--------+    +--------+      +--------+      +--------+         +--------+      +--------+                  |
+---------------------------------------------------------------------------------------------------------------+
```

---

## 2. Card Detail Drawer Specification

When a card is clicked, it slides open a detail drawer that correlates telemetry inputs:

### General Info
*   **Target Scope:** Role, Company, Goal Description, and Owning Orchestrator.
*   **Progress Timeline:** Micro-steps breakdown with visual success indicators.

### Observability Tabs
*   **Trace Map:** Live DAG rendering highlighting dependencies and current step paths.
*   **Agent Telemetry:** Chain-of-thought streams, raw JSON responses, and token trace streams.
*   **Audit logs:** Schema checks, cost tracking records, and validation critic reviews.
*   **Historical Timeline:** State transition event logs (`TASK_ACCEPTED` -> `EXECUTION_STARTED` -> `PARTIAL_COMPLETE` -> `COMPLETED`).
