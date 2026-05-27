# Dependency Graph

## Purpose

Inferred module dependency edges. Enables understanding of change blast radius.

## Process Entry Points

```
bin/web.ts
  → lib/runtime/settings
  → lib/runtime/shutdown

bin/worker.ts
  → lib/queue/workers
  → lib/runtime/shutdown

bin/scheduler.ts
  → lib/queue/scheduler
  → lib/runtime/shutdown
```

## API Route → Library Dependencies

```
/api/agents/execute
  → lib/db (prisma)
  → lib/agents/prompts (AgentType)
  → app/api/middleware/auth (getCurrentUser)
  → lib/agents/store (appendExecutionLog)
  → lib/logging/logger
  → lib/middleware/rateLimiter
  → lib/queue/events (publishRealtimeEvent)
  → lib/queue/payload (sanitizeQueuePayload)
  → lib/queue/queues (enqueueExecution)

/api/agent/execution/[id]/subscribe
  → lib/db (prisma)
  → lib/agents/store (getExecutionEnvelope)
  → lib/realtime/sharedSubscriber (subscribeToExecution)
  → lib/runtime/settings (sseHeartbeatMs)

/api/ops/metrics
  → lib/observability/metrics (getMetricsSnapshot)
  → lib/queue/queues (getQueueMetrics)

/api/ops/providers
  → lib/observability/provider-health (getAllProviderHealthReports)
```

## Core Dependency Chain: Agent Execution

```
lib/queue/workers
  → lib/agents/executor
      → lib/governance/promptRegistry
          → lib/db (prisma.promptVersion)
          → lib/agents/prompts
      → lib/governance/policyEngine
          → lib/agents/prompts (AgentType)
          → lib/logging/logger
      → lib/governance/outputValidator
          → zod
          → lib/agents/prompts
          → lib/logging/logger
      → lib/governance/hallucinationControls
          → lib/agents/prompts
          → lib/logging/logger
      → lib/llm/anthropic
          → @anthropic-ai/sdk
      → lib/db (prisma.agentExecution)
      → lib/agents/store (appendExecutionLog)
  → lib/observability/metrics
  → lib/observability/failure-classification
  → lib/observability/tracing
  → lib/queue/concurrency
      → lib/redis/redisClient
  → lib/queue/queues (enqueueDeadLetter)
      → lib/queue/dead-letter
      → lib/queue/retry-policy
      → lib/redis/redisClient
      → lib/runtime/settings
  → lib/queue/events (publishRealtimeEvent)
      → lib/redis/redisClient
  → lib/runtime/settings
  → lib/logging/logger
```

## Real-Time Path

```
lib/queue/events.publishRealtimeEvent()
  → ioredis PUBLISH to channel: "user:<userId>:execution:<executionId>"

lib/realtime/sharedSubscriber.subscribeToExecution()
  → ioredis SUBSCRIBE
  → on message → callback(event)

/api/agent/execution/[id]/subscribe (SSE)
  → subscribeToExecution(id, handler)
  → handler → ReadableStream.enqueue(sseEvent)
```

## Frontend → Backend Dependency

```
src/lib/agent/agentService.ts (browser)
  → fetch('/api/agent/execution/...')
  → EventSource('/api/agent/execution/[id]/subscribe')

src/hooks/useAgentRealTime.ts
  → lib/agent/agentService.subscribeToAgentExecution()

src/hooks/useAgentExecution.ts
  → @tanstack/react-query
  → lib/agent/agentService.getAgentExecution()
```

## Shared Infrastructure

```
lib/logging/logger
  ← used by: all lib/* modules

lib/runtime/settings
  ← used by: bin/*, lib/queue/*, lib/realtime/*

lib/db (prisma client)
  ← used by: lib/agents/store, lib/governance/promptRegistry,
              lib/db/jobs, lib/db/profile, lib/db/documents,
              lib/db/offers, all API routes

lib/redis/redisClient
  ← used by: lib/queue/queues, lib/queue/workers,
              lib/queue/concurrency, lib/queue/events,
              lib/realtime/sharedSubscriber
```

## Change Impact Assessment

| Changed Module | Downstream Impact |
|---|---|
| `lib/governance/policyEngine.ts` | All agent executions; worker restart required |
| `lib/governance/outputValidator.ts` | Validation results for all executions |
| `lib/governance/hallucinationControls.ts` | Hallucination block/warn decisions |
| `lib/agents/prompts.ts` | Prompt v1.0.0 seed content; affects all first-run bootstraps |
| `lib/queue/queues.ts` | Queue config; requires worker + web restart |
| `lib/queue/workers.ts` | Worker restart required |
| `lib/runtime/settings.ts` | All three processes; requires full restart |
| `prisma/schema.prisma` | Requires `db:migrate`; all processes need restart |

## Last Updated
2026-05-27
