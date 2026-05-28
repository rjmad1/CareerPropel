# Governance Model (docs/orchestration/GOVERNANCE.md)

This document describes the safety constraints, cost controls, privacy mechanisms, and validation rules governing the execution engine.

---

## 1. Safety Thresholds and Approval Boundaries

Operations are categorized into risk tiers to dictate execution autonomy boundaries:

| Risk Tier | Examples | Autonomy Protocol |
|-----------|----------|-------------------|
| **Low** | Research, Job matching, Follow-up drafting | 100% Autonomous |
| **Medium**| Modifying resume bullet points, scheduling prep tasks | Autonomous (emits telemetry) |
| **High** | Code modifications, outreach transmissions | Human approval gate required (`StepType.approval`) |
| **Critical**| Deployments, production integrations | Always halted; requires operator authentication |

---

## 2. Token & Financial Cost Ceilings

The Governance Engine continuously intercepts execution costs:
*   **Invocation Guard:** If an agent's individual execution cost exceeds its preset allocation (e.g. `maxCostLimit: 0.15`), it halts immediately.
*   **Workflow Budget:** Aggregate costs for a single dynamic DAG cannot exceed a ceiling (defaults to `$2.00` per workflow, configurable in settings).
*   **Accumulated Billing:** Once cost thresholds are breached, the workflow transitions to `Blocked` lane, notifying the operator.

---

## 3. Validation critic Auditing

The Validation Critic Agent checks every finalized output before unblocking downstream dependency steps:
```typescript
interface ValidationCriticResult {
  schemaValidated: boolean;
  semanticConsistencyScore: number; // 0-100
  containsSecretCredentials: boolean;
  policyChecksPassed: boolean;
  errors: string[];
}
```
If `policyChecksPassed` returns false, the step transitions to `Failed`, and a rollback operation is executed.
