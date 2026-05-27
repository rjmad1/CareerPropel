# AI Observability Console — Systems Architecture Guide

This document provides a comprehensive overview of the design patterns, visualization schemas, state layers, and extensibility boundaries of the **Modular Front-end AI Observability Console**.

---

## 1. Modular Architecture Overview

The observability platform is isolated inside `src/observability-platform` and seamlessly mounted into the host Next.js router at `src/app/observability`. This structure is structured to represent a clean **monorepo-ready layout** to guarantee decoupling from specific AI orchestrators.

```
/src/observability-platform/
  ├── packages/
  │   ├── telemetry-sdk/    # TypeScript types and schemas
  │   ├── api-client/       # API wrapper & WebSockets telemetry simulator
  │   └── workflow-viz/     # Advanced visualizations (Trace Trees, DAG, Swim Lanes)
  │
  ├── Dockerfile.observability  # Production multi-stage deployment build
  └── observability_ci_cd.yml   # Automatic validation & build pipeline
```

---

## 2. Advanced Trace & Workflow Visualization

The platform implements three highly interactive rendering models using React & SVG:

### A. Hierarchical Trace Tree (`TraceTree.tsx`)
Recursively prints nested trace spans.
- Maintains dynamic indent margins based on span depth (`depth * 16px`).
- Shows status checkpoints (Success, Failure, In Progress).
- Identifies prompt and completion token counts on LLM generations.

### B. Workflow Directed Acyclic Graph (`WorkflowDAG.tsx`)
Reconstructs agent flow pipelines visually using standard absolute coordinate columns.
- Draws smooth cubic bezier curves between nodes using pure SVG layout graphs.
- Highlights execution failures and duration hotspots on tool frames.

### C. Chronological Swim Lanes (`AgentSwimLanes.tsx`)
Illustrates parallel multi-agent activity tracks.
- Groups tasks by agent name horizontally.
- Computes start/end percentage coordinates inside the overall execution timeline.

---

## 3. Real-Time Telemetry & Sync Layer

Real-time telemetry streams are powered by `TelemetryApiClient`'s observer channel.
- Implements background event generators pushing metrics every 3.5 seconds.
- Automatically normalizes traces and spans in local memory.
- Throttles rendering lines (caps at 30 events) inside the Live Monitor Console to prevent rendering slowdowns or memory leaks under heavy workloads.

---

## 4. Dynamic Plugin SDK & Extensibility

The console supports dynamic white-labeling and extensibility:
- **Tenant Isolation**: Custom dropdown handles token segmentation scopes (`tenant-enterprise-ops` | `tenant-developer-sandbox`).
- **Accent Theming**: Instantly swaps accent color schemes dynamically across slate, emerald, and amber palettes.
- **Custom Widgets**: Features a dynamic custom widgets sandbox frame prepared to mount dynamically registered dashboard panels.
