# Documentation Index

All canonical documentation for CareerPropel. Start here.

---

## Getting Started

- [Setup Guide](development/SETUP_GUIDE.md) — local dev environment
- [CONTRIBUTING.md](../CONTRIBUTING.md) — contribution workflow
- [AI-Assisted Workflow](development/AI_WORKFLOW.md) — using AI assistants with the spec kit

## Architecture

- [Architecture Overview](architecture/AGENT_SYSTEM.md) — AI agent system
- [Profile Intelligence](architecture/PROFILE_INTELLIGENCE.md) — profile matching
- [API Design Reference](API_DESIGN.md) — full API endpoint reference

## Governance

- [Spec Workflow](governance/SPEC_WORKFLOW.md) — spec-driven engineering model ← **Start here for new features**
- [Engineering Standards](governance/ENGINEERING_STANDARDS.md) — coding and review standards
- [AI Governance](governance/AI_GOVERNANCE.md) — LLM/prompt governance framework
- [Risk Registry](governance/risk-registry.md) — tracked technical debt

## Architecture Decision Records

- [ADR 001: Playwright Scraping Quarantine](adr/001-scraping-isolation.md)
- [ADR 002: Authorization Governance](adr/002-authorization-governance.md)
- [ADR 003: Spec-Driven Engineering](adr/003-spec-driven-engineering.md)

## Schema & Data

- [Database Schema](schema/DATABASE_SCHEMA.md)

## Security

- [Threat Model](security/THREAT_MODEL.md)

## Testing

- [Testing Strategy](testing/TESTING_STRATEGY.md)

## Reliability

- [SLOs](reliability/SLOs.md)

## Operational

- [Incident Response Runbook](runbooks/INCIDENT_RESPONSE.md)
- [Database Operations Runbook](runbooks/DATABASE_OPERATIONS.md)
- [Production Readiness Checklist](operational-readiness/CHECKLIST.md)

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
