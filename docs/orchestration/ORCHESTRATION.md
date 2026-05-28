# Orchestration Runtime & Engine (docs/orchestration/ORCHESTRATION.md)

This document details the scheduling, state machine transitions, and BullMQ worker queue integrations for dynamic orchestration.

---

## 1. Dynamic DAG Schedulers

Dynamic workflows bypass static JSON structures by translating dynamic graphs directly into the platform's execution layer:

```
[User Input] --> Ingestion Meta-Agent --> DAG Graph Generator
                                                  |
                                                  v
[Worker Queue] <-- Arbitrator Compiler <-- Prisma Definitions Table
```

### Steps Scheduling Loop
1. The **Arbitrator** compiles the dynamic DAG steps list.
2. Steps are persisted with state `StepStatus.pending`.
3. The queue worker (`advanceWorkflow` in `src/lib/workflow/engine.ts`) executes steps sequentially or resolves parallel paths by checking the `dependencies: string[]` field on-the-fly.

---

## 2. Event-Driven State-Machine Transitions

Execution status mappings are DB-enforced to prevent race conditions:

| Starting Status | Action / Event | Target Status |
|-----------------|----------------|---------------|
| `queued` | `process` | `running` |
| `running` | `suspend` | `waiting_for_approval` |
| `running` | `abort` | `failed` |
| `running` | `finish` | `completed` |
| `failed` | `recover` | `queued` |

---

## 3. BullMQ Schedulers & Workers Integration
We reuse the platform's standard BullMQ queue (`getWorkflowQueue()`), enqueuing tasks with structured payloads containing:
*   `workflowExecutionId`: UUID of the database execution trace.
*   `stepIndex`: Integer tracking the step array sequence.
*   `userId`: email of the candidate session.
*   `schemaVersion`: Semantic format tracking configuration.
