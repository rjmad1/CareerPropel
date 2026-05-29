# Career Propel — Enterprise Engineering Wiki

Welcome to the engineering and operational source of truth for **Career Propel**. This wiki is version-aware, modular, and automatically aligned with the active codebase.

---

## 🗺️ 1. Overview & Branding

Career Propel is a production-grade, AI-native career management SaaS platform designed to orchestrate a candidate's entire job search lifecycle.

*   **[Enterprise Platform Documentation Book](Enterprise-Grade-Platform-Documentation.md)**: Full 16-chapter exhaustive manual for CareerPropel.
*   **[Branding & Nomenclature](../BRANDING_RENAME_REPORT.md)**: Details on the transition from Career Ops to Career Propel.
*   **[Setup & Getting Started](../docs/getting-started.md)**: Local installation, environment configuration, and initial database setup.
*   **[Demo Data Guide](../docs/DEMO_DATA_GUIDE.md)**: Guidelines for seeding demo, medium, and stress profiles.


---

## 🏛️ 2. Architecture & Bounded Contexts

*   **[Architecture Handbook](../docs/adr/ARCHITECTURE_HANDBOOK.md) 🌟**: Comprehensive diagrams and maps of the entire topology, BullMQ execution pipeline, and WebSocket/SSE dual communications.
*   **[System Overview](architecture/system-overview.md)**: Module boundaries, technical specs, and foundational design choices.
*   **[Runtime Flow](architecture/runtime-flow.md)**: Step-by-step trace of the agent execution lifecycle.
*   **[Deployment Topology](architecture/deployment-topology.md)**: Infrastructure, process models, and horizontal scaling strategies.
*   **[Module Index](architecture/module-index.md)**: Bounded module graph with dependency edges.
*   **[Current Architecture Snapshot](architecture/current-architecture-snapshot.md)**: Codebase architecture overview bootstrap.
*   **[Runtime Ownership Map](architecture/runtime-ownership-map.md)**: Bounded runtime ownership mappings.
*   **[Forbidden Patterns Registry](architecture/forbidden-patterns.md)**: Prohibited design patterns.
*   **[Canonical Patterns Registry](architecture/canonical-patterns.md)**: Approved implementation templates.

---

## ⚙️ 3. Core Bounded Components

*   **[Agent System](components/agent-system.md)**: Main prompt-assembly and execution engine.
*   **[Agent System Audit](components/agent-system-audit.md)**: Detailed audit of active agents and dependencies.
*   **[Queue Infrastructure](components/queue-infrastructure.md)**: BullMQ integration, concurrency gates, retry policies, and dead-letter queues (DLQ).
*   **[Real-Time SSE & Socket.io](components/realtime-sse.md)**: Redundant dual-transport event streams.
*   **[Observability & Telemetry](components/observability.md)**: Pino logging, OpenTelemetry tracing, and provider health checks.
*   **[Governance Layer](components/governance.md)**: Prompt sanitization, input filters, and validation schemas.

---

## 🔒 4. Security & Access Control

*   **[Auth & Security Architecture](components/auth.md)**: NextAuth v4 integration, RBAC permission models, and brute force protection.
*   **[Token & Credential Encryption](../src/lib/crypto/tokenEncryption.ts)**: Application-layer AES-256-GCM encryption for Google and Microsoft Outlook OAuth tokens (Remediation RASUI-002 / RASUI-003).

---

## 🛠️ 5. Operational Runbooks

*   **[Local Development Runbook](runbooks/local-dev.md)**: Step-by-step developer guide, testing guidelines, and troubleshooting.
*   **[Operations Runbook](runbooks/ops-runbook.md)**: Incident response, database migration strategies, and service health checks.
*   **[Release Governance](runbooks/release-governance.md)**: Deployment validation and release protocols.
*   **[Glossary of Terms](glossary/terms.md)**: Domain language and term mappings.

---

*Documentation compiled and verified on: 2026-05-28*
