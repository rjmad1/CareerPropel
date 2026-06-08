# Documentation Index

All canonical documentation for CareerPropel. Start here.

---

## Getting Started

- [Setup Guide](../wiki/runbooks/local-dev.md) — local dev environment
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution workflow
- [AI-Assisted Workflow](ai-assisted-sdlc-workflow.md) — using AI assistants with the spec kit

## Architecture

- [Architecture Overview](../wiki/components/agent-system.md) — AI agent system
- [Architecture System Overview](../wiki/architecture/system-overview.md) — System design and runtime topology
- [API Contract Matrix](architecture/API_CONTRACT_MATRIX.md) — API integrations and schemas
- [Event Ledger Architecture](architecture/EVENT_LEDGER_ARCHITECTURE.md) — agent transaction ledger
- [Extraction Path Audit](architecture/EXTRACTION_PATH_AUDIT.md) — profile parsing verification
- [Schema Route Reconciliation](architecture/SCHEMA_ROUTE_RECONCILIATION.md) — schema-route mapping and coverage

## Governance

- [Spec Workflow](governance/SPEC_WORKFLOW.md) — spec-driven engineering model ← **Start here for new features**
- [Engineering Standards](governance/ENGINEERING_STANDARDS.md) — coding and review standards
- [AI Governance](governance/AI_GOVERNANCE.md) — LLM/prompt governance framework
- [Risk Registry](governance/risk-registry.md) — tracked technical debt
- [Agent Operating Model](governance/ENGINEERING_AGENT_OPERATING_MODEL.md) — developer and agent workflow integration
- [Replay Governance](governance/REPLAY_GOVERNANCE.md) — telemetry event replay and security rules

## Architecture Decision Records

- [ADR 001: Playwright Scraping Quarantine](adr/001-scraping-isolation.md)
- [ADR 002: Authorization Governance](adr/002-authorization-governance.md)
- [ADR 003: Spec-Driven Engineering](adr/003-spec-driven-engineering.md)

## Schema & Data

- [Database Schema](../prisma/schema.prisma)

## Security

- [Threat Model](security/THREAT_MODEL.md)

## Testing

- [Testing Strategy](testing/TESTING_STRATEGY.md)
- [Chaos Testing](testing/CHAOS_TESTING.md) — recovery validation under failure modes

## Reliability

- [SLOs](reliability/SLOs.md)
- [Reliability Engineering](reliability/RELIABILITY_ENGINEERING.md) — platform resilience and SLAs
- [Runtime Compatibility](reliability/RUNTIME_COMPATIBILITY.md) — node/v8 environment restrictions

## Operational & Readiness

- [Incident Response Runbook](runbooks/INCIDENT_RESPONSE.md)
- [Database Operations Runbook](runbooks/DATABASE_OPERATIONS.md)
- [Production Readiness Checklist](operational-readiness/CHECKLIST.md)
- [GA Readiness Checklist](readiness/GA_READINESS_CHECKLIST.md) — General Availability milestone track
- [Product Capability Scorecard](readiness/PRODUCT_CAPABILITY_SCORECARD.md) — core product metrics scorecard
- [Product Convergence Matrix](readiness/PRODUCT_CONVERGENCE_MATRIX.md) — milestone feature mapping
- [Product Success Metrics](readiness/PRODUCT_SUCCESS_METRICS.md) — user funnel & engagement metrics
- [Beta Feedback Framework](readiness/BETA_FEEDBACK_FRAMEWORK.md) — feedback collection channels
- [Beta Feedback Report](readiness/BETA_FEEDBACK_REPORT.md) — synthesis of beta feedback findings
- [Extraction Evaluation Report](readiness/EXTRACTION_EVALUATION_REPORT.md) — parsing accuracy metrics against golden dataset

---

## Root-Level Files (Legacy / Reference)

The following files exist at the project root from earlier development phases.
They contain historical context but are superseded by the docs above.

| File | Status | Superseded By |
|---|---|---|
| `ARCHITECTURE.md` | Historical | `docs/architecture/`, `docs/adr/` |
| `SECURITY_IMPLEMENTATION.md` | Historical | `docs/security/THREAT_MODEL.md` |
| `DEPLOYMENT_GUIDE.md` | Historical | `docs/runbooks/` |
| `AUTH_IMPLEMENTATION_GUIDE.md` | Historical | `docs/architecture/` |
| `WEEK5_*.md`, `PHASE_*.md` | Historical sprint notes | `docs/governance/risk-registry.md` |
| `API_SETUP_GUIDE.md` | Historical | `docs/API_DESIGN.md` |

These files will be consolidated or removed in a future maintenance pass.
