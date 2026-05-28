# Prioritization Engine (docs/orchestration/PRIORITIZATION.md)

This document details the background ranking algorithm that determines task prioritization in the engine backlog.

---

## 1. The Priority Score Formula

The priority score ($P$) is dynamically calculated inside a cron schedule using the following formula:

$$P = w_1 \cdot C_b + w_2 \cdot D_p + w_3 \cdot U_{SLA} + w_4 \cdot A_{avail} - w_5 \cdot K_{cost}$$

Where:
*   $C_b$ (**Business Criticality / Strategic Alignment**): Rated 1–10 based on task scope and keyword analysis.
*   $D_p$ (**Dependency Pressure**): Count of downstream workflow steps that are currently blocked by this execution node.
*   $U_{SLA}$ (**SLA Urgency**): Proximity of the task deadline to current local time.
*   $A_{avail}$ (**Agent Availability**): Measures queue levels and availability of required worker agents.
*   $K_{cost}$ (**Execution Cost Predictor**): Expected token expenses.

---

## 2. Strategic Weights Configurations

The weights are stored in the platform database configurations:

```json
{
  "weights": {
    "businessCriticality": 4.0,
    "dependencyPressure": 3.0,
    "slaUrgency": 5.0,
    "agentAvailability": 1.5,
    "costPenalty": 2.0
  }
}
```

*   **SLA Urgency** carries the highest default weighting to ensure near-term milestones are resolved first.
*   **Cost Penalty** ensures massive, token-heavy workflows do not clog up execution bandwidth.
