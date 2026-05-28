# Orchestration Architecture (docs/orchestration/ARCHITECTURE.md)

This document maps out the high-level boundaries and interfaces of the Autonomous Multi-Agent Orchestration module.

---

## 1. High-Level Modular Decoupling

The module is strictly separated into four decoupled layers to ensure portability:

```
+---------------------------------------------------------------------------------+
|                               VISUALIZATION LAYER                               |
|        Trello Swimlane UI Component / Glass Cockpit Observability Dash          |
+---------------------------------------+-----------------------------------------+
                                        | (Standard Event / State Protocol)
                                        v
+---------------------------------------+-----------------------------------------+
|                               ORCHESTRATION CORE                                |
|            DAG Parser   -   Task Ingestion Engine   -   State Machine           |
+---+-----------------------------------+-------------------------------------+---+
    |                                   |                                     |
    v                                   v                                     v
+---+----------------+         +--------+-------+         +-------------------+---+
| AGENT ADAPTER      |         | EVENT BUS      |         | TELEMETRY ADAPTER |   |
| Decouples Claude/  |         | Abstract pub/  |         | Normalizes logs & |   |
| MCP executions.    |         | sub transport  |         | token costs to the|   |
| Exposes standard   |         | (Redis, In-    |         | database layout.  |   |
| capability formats.|         | Memory, SSE).  |         |                   |   |
+--------------------+         +----------------+         +-------------------+---+
```

### Module Interfaces

#### A. Ingestion Engine
Responsible for expanding user intentions and constructing the base execution context:
```typescript
interface IngestionResult {
  title: string;
  expandedContext: string;
  domain: 'codebase' | 'profile' | 'research' | 'interview';
  predictedComplexity: 'low' | 'medium' | 'high';
  estimatedCostUsd: number;
  initialPriorityScore: number;
}
```

#### B. Orchestrator Engine (Arbitrator)
Manages the dynamic step allocation and DAG progression:
```typescript
interface OrchestratorCore {
  initializeWorkflow(context: IngestionResult): Promise<string>;
  advanceStep(workflowId: string, completedStepKey: string, stepOutput: any): Promise<void>;
  haltWorkflow(workflowId: string, reason: string): Promise<void>;
}
```

#### C. Governance Engine
Ensures safety constraints are met before step transitions:
```typescript
interface GovernanceEngine {
  validateStepApproval(step: WorkflowStepDefinition, payload: any): Promise<boolean>;
  validateCostLimits(workflowId: string): Promise<boolean>;
  sanitizeAgentInput(prompt: string): string;
}
```

---

## 2. In-Depth Component Interactions

```mermaid
sequenceDiagram
    autonumber
    actor Human
    participant Ingestion as Ingestion Engine
    participant Orchestrator as Orchestrator Agent
    participant Gov as Governance Engine
    participant Worker as BullMQ Worker
    participant Telemetry as Telemetry Normalizer
    participant DB as Prisma / Database
    participant Frontend as Observability UI

    Human->>Ingestion: Submits Task ("Fix Latency")
    activate Ingestion
    Ingestion->>DB: Fetch Context
    Ingestion-->>Orchestrator: Emits Task Context & Initial Priority
    deactivate Ingestion

    activate Orchestrator
    Orchestrator->>Gov: Validate Proposed DAG Plan
    Gov-->>Orchestrator: Plan Confirmed
    Orchestrator->>DB: Persist WorkflowExecution & Steps
    DB-->>Frontend: SSE: Card Added to Prioritized Backlog
    Orchestrator->>Worker: Enqueue Step 1 Job
    deactivate Orchestrator

    activate Worker
    Worker->>DB: Update Step to In Progress
    DB-->>Frontend: SSE: Card Moves to In Progress
    Worker->>Worker: Run Agent Task
    Worker->>Telemetry: Emit Token/Cost Traces
    Telemetry->>DB: Write TokenUsageLog
    Worker->>DB: Update Step to Completed
    DB-->>Frontend: SSE: Progress Percentage Updates
    deactivate Worker
```
