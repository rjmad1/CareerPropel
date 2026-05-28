# Autonomous Multi-Agent Orchestration Module (docs/orchestration)

Welcome to the **Autonomous Multi-Agent Orchestration Engine**. This module provides a visual, event-driven coordination and execution layer that embeds directly within your AI operations platform. 

It handles natural language task expansion, dynamic Directed Acyclic Graph (DAG) path planning, agent task scheduling, and real-time frontend swimlane synchronization.

---

## Directory Structure

```
docs/orchestration/
├── TIER 1: Core System Architecture
│   ├── README.md               <-- You are here
│   ├── ARCHITECTURE.md         <-- High-Level Agent Coordination Layout
│   ├── ORCHESTRATION.md        <-- DAG Execution & Runtime Pipeline
│   ├── AGENTS.md               <-- Agent Communication Protocols
│   ├── EVENT_SYSTEM.md         <-- Pub/Sub Schemas & SSE Streams
│   ├── STATE_MACHINE.md        <-- StepStatus & WorkflowStatus Rules
│   ├── GOVERNANCE.md           <-- Safety, Cost & Privacy Gates
│   ├── WORKFLOW_ENGINE.md      <-- BullMQ Integration & Dynamic Worker Loop
│   ├── EXECUTION_GRAPH.md      <-- Graph Construction & Target Mapping
│   ├── MEMORY_MODEL.md         <-- Vector-Based Context Retrievals
│   ├── TELEMETRY.md            <-- Trace Tracking & Cost Accumulation
│   ├── TASK_LIFECYCLE.md       <-- Detailed Execution Timeline Guide
│   ├── PRIORITIZATION.md       <-- Dynamic Backlog Priority Score Formula
│   ├── RETRY_POLICIES.md       <-- Failure Recovery & Exponential Backoffs
│   └── ESCALATION_RULES.md     <-- Safety Violations & Operator Overrides
│
└── TIER 2: Capabilities & Integrations
    ├── AGENT_CAPABILITIES.md   <-- JSON Registers of Active Agents & Latencies
    ├── TOOL_REGISTRY.md        <-- Attaching Custom Tools to Agent Runtimes
    ├── WORKFLOW_PATTERNS.md    <-- Common DAG Recipes & Template Outlines
    ├── FAILURE_HANDLING.md     <-- Heartbeats & Stall Detectors Handbook
    ├── OBSERVABILITY.md        <-- Frontend Dashboard Glass Cockpit Layouts
    ├── VECTOR_MEMORY.md        <-- Vector Embeddings and Semantic Storage Models
    ├── RAG_PIPELINE.md         <-- Context Ingestion and Parsing Routines
    ├── CONTEXT_INJECTION.md    <-- Dynamic Prompt Construction Manual
    ├── COST_MANAGEMENT.md      <-- Token Budgets & Cost Minimization
    └── SLA_MANAGEMENT.md       <-- Milestones, Deadlines & Critical Path Analysis
```

---

## Getting Started

### 1. Configure the Environment Keys
Ensure your `.env.local` includes your Redis and model provider parameters:
```env
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/career_propel
AGENT_COST_CEILING_USD=2.00
AUTONOMY_LEVEL=semi-autonomous
```

### 2. Instantiate the Ingestion Engine
```typescript
import { IngestionEngine } from '@/lib/orchestration/ingestion';

const executionContext = await IngestionEngine.expandIntent(
  "Fix telemetry latency",
  userId
);
```

### 3. Run the DAG Execution Loop
The module automatically translates the task into a DAG execution tree and queues it into the active worker pipeline:
```typescript
import { Orchestrator } from '@/lib/orchestration/core';

const workflowId = await Orchestrator.initializeWorkflow(executionContext);
console.log(`Workflow Execution ${workflowId} initialized!`);
```
