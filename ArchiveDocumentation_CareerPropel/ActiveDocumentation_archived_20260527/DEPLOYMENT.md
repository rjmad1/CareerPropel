# Deployment

## Canonical Production Topology

- Frontend/API: Vercel or a containerized Node runtime
- Worker runtime: Railway, Fly.io, ECS, or another long-running container platform
- Scheduler runtime: same platform as workers, exactly one replica
- Redis: Upstash or Redis Cloud
- PostgreSQL: Neon, Supabase, or RDS
- Object storage: Cloudflare R2
- Monitoring: Sentry and Better Stack

## Required Environment Variables

- `DATABASE_URL`
- `REDIS_URL`
- `NEXTAUTH_URL`
- `LOG_LEVEL`
- `LLM_PROVIDER`
- Provider secrets such as `ANTHROPIC_API_KEY` or `NIM_API_KEY`
- Optional queue controls:
  - `QUEUE_CONCURRENCY`
  - `QUEUE_ATTEMPTS`
  - `QUEUE_BACKOFF_MS`
  - `EXECUTION_TIMEOUT_MS`
  - `USER_CONCURRENCY_LIMIT`
  - `AGENT_CONCURRENCY_LIMIT`

## Deploy Order

1. Apply Prisma migration for `AgentExecution`, `ToolCall`, and `EventLog`.
2. Deploy web runtime.
3. Deploy worker runtime.
4. Deploy one scheduler runtime.
5. Verify `/ready` on web and queue metrics in `/health`.

## Zero-Downtime Notes

- Web replicas are stateless and scale horizontally.
- Workers can be rolled independently.
- Scheduler must remain singleton; replace one instance at a time.
- Queue job ids are deterministic (`executionId`) to avoid duplicate execution during rollout.

## Rollback

1. Stop new web traffic or revert the web deployment.
2. Keep workers up until active jobs drain.
3. Roll worker image back.
4. Roll scheduler back.
5. If a schema rollback is required, drain the queue first.
