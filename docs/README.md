# CareerPropel — Developer Documentation

> AI-native career management platform with autonomous job application automation.

## Quick Links

| Document | Description |
|---|---|
| [Documentation Index](INDEX.md) | Full table of contents for all platform docs |
| [Repository Map](repository-map.md) | Directory structure and module ownership |
| [Getting Started](getting-started.md) | Local development setup |
| [Development Workflow](development-workflow.md) | Day-to-day engineering practices |
| [GA Readiness Checklist](readiness/GA_READINESS_CHECKLIST.md) | Release governance & checklists |
| [Reliability Engineering](reliability/RELIABILITY_ENGINEERING.md) | Platform resilience and SLAs |
| [Architecture Overview](../wiki/architecture/system-overview.md) | System design and runtime topology |
| [Agent System](../wiki/components/agent-system.md) | AI execution pipeline |
| [Governance Layer](../wiki/components/governance.md) | Policy engine, prompt versioning, output validation |
| [Queue Infrastructure](../wiki/components/queue-infrastructure.md) | BullMQ job processing |
| [Observability](../wiki/components/observability.md) | Metrics, tracing, provider health |

## Runtime Processes

The application runs as **three separate processes**:

```
npm run start:web        # Next.js HTTP server (port 3000)
npm run start:worker     # BullMQ execution worker
npm run start:scheduler  # Queue scheduler / cleanup daemon
```

All three must be running for full functionality. See [Deployment Topology](../wiki/architecture/deployment-topology.md).

## Technology Stack

- **Runtime**: Node.js 20+ / Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Queue**: BullMQ (Redis-backed)
- **AI Provider**: Anthropic Claude (primary)
- **Auth**: NextAuth v4 (session-based + 2FA)
- **Frontend**: React 18, MUI v9, Tailwind CSS, Zustand
- **Real-time**: Server-Sent Events (SSE)

## AI-Generated Summary

### Execution Mode
Full Discovery Mode — initial bootstrap from source

### Files Analyzed
All source files under `src/`, `prisma/`, `src/bin/`

### Confidence Level
High — derived from types, implementations, API contracts, migrations

### Last Updated
2026-05-27
