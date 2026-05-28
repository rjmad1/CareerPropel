# Agent Orchestration (docs/orchestration/AGENTS.md)

This document defines the communication format between the **Orchestrator Agent** and **Specialized Worker Agents** and points out structural gaps that need to be created.

---

## 1. Unified Agent Interface

All agents within the orchestration domain implement a standard communication protocol:

```typescript
export interface StandardAgentRequest {
  taskId: string;
  workflowId: string;
  agentType: string;
  context: Record<string, any>;
  promptOverride?: string;
  maxCostLimitUsd?: number;
}

export interface StandardAgentResponse {
  success: boolean;
  output: Record<string, any>;
  costUsd: number;
  tokensUsed: {
    input: number;
    output: number;
  };
  validationErrors?: any[];
  reasoning: string;
}
```

---

## 2. Capability Advertisement Schema

For the Orchestrator to allocate tasks intelligently, specialized agents advertise their profile:

```json
{
  "agentType": "resume-tailor",
  "tools": ["read_file", "write_file", "search_code"],
  "costProfile": {
    "averageCostPerExecutionUsd": 0.04,
    "maxCostLimitUsd": 0.15
  },
  "metrics": {
    "successRate": 0.96,
    "averageLatencyMs": 4200
  },
  "safetyRating": "high"
}
```

---

## 3. Structural Meta-Agent Gaps (For the User to Build)

### Gap A: Ingestion / Intention Expansion Agent (`ingestion-agent`)
*   **Role:** Metacognitive parser that translates short text ("Fix latency") into structural parameters.
*   **Gaps to address:** Must run vector checks to fetch past workflows and codebase schemas, outputting domain classification and target metrics.

### Gap B: Arbitrator / Orchestrator Agent (`arbitrator-agent`)
*   **Role:** The core decision meta-agent that monitors execution branches and resolves conflict pathways.
*   **Gaps to address:** Needs to analyze current system load and resolve failed step rerouting paths.

### Gap C: Validation Critic Agent (`validation-critic`)
*   **Role:** Independent auditor reviewing step outputs prior to downstream execution.
*   **Gaps to address:** Evaluates outputs against JSON schemas, confirms token costs, and checks privacy/autonomy rules.
