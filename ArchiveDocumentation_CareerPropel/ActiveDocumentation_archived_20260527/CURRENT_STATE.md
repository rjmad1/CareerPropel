# Current State

## Summary

CareerPropel currently has a modernized runtime and orchestration backbone, but the product layer is still partially scaffolded and has visible drift between schema, routes, and UI assumptions.

## What Is Current

- Queue-backed execution with dedicated `web`, `worker`, and `scheduler` runtimes
- BullMQ-based execution flow with retries, dead-letter handling, and Redis-backed concurrency controls
- SSE subscription flow for execution updates
- Live Prisma schema for candidates, jobs, profile data, offers, agent executions, tool calls, and event logs

## What Is Not Yet Fully Aligned

- Some API routes still reference fields or models that do not exist in the current Prisma schema
- Some UI surfaces still use mock data or placeholder behavior
- Older documentation in the archive describes broader product behavior than the current code actually implements

## Validation Snapshot

At the time this active-doc consolidation was created:

- `npm run type-check` reported 240 TypeScript errors
- `npm run lint` reported 202 warnings

Those numbers make the code a better source of truth than older planning and status documents, but they also mean the codebase still needs reconciliation work.

## Best Places To Work From

1. `../package.json`
2. `../prisma/schema.prisma`
3. `../src/bin/web.ts`
4. `../src/bin/worker.ts`
5. `../src/bin/scheduler.ts`
6. `../src/lib/queue/`
7. `../src/app/api/agents/`
8. `../src/app/api/agent/`
9. `../src/app/dashboard/page.tsx`
10. `../src/components/CareerOS/IntegratedDashboard.tsx`

## Practical Guidance

- Treat the runtime and queue docs in this folder as current.
- Treat archived roadmap, phase, week, security-summary, and earlier architecture docs as historical context.
- Before implementing product features, verify the target behavior against `schema.prisma` and the matching route files.
