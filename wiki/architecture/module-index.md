# Module Index

## Purpose

Catalogue of all significant modules with their public interfaces, ownership, and dependency edges.

## Core Infrastructure Modules

### `src/lib/runtime/settings.ts`
- **Purpose**: Single source for all runtime configuration
- **Exports**: `runtimeSettings` (frozen object), `getNumericEnv`
- **Source**: `process.env` with sensible defaults
- **Used by**: web.ts, worker.ts, scheduler.ts, queue/workers.ts, queue/queues.ts

### `src/lib/runtime/shutdown.ts`
- **Purpose**: Graceful shutdown handler for all three processes
- **Exports**: `registerGracefulShutdown(processName, closables, childProcess?)`
- **Used by**: bin/web.ts, bin/worker.ts, bin/scheduler.ts

### `src/lib/redis/redisClient.ts`
- **Purpose**: Managed Redis connection factory; named connections for observability
- **Exports**: `createRedisClient(name)`, `disconnectRedisClient(client)`
- **Used by**: queue/queues.ts, queue/workers.ts, realtime/

### `src/lib/db/`
- **Purpose**: Typed Prisma repository functions per domain
- **Files**: `jobs.ts`, `profile.ts`, `documents.ts`, `offers.ts`
- **Pattern**: Each file exports typed CRUD/query functions that wrap `prisma.*`

## Agent Execution Modules

### `src/lib/agents/executor.ts`
- **Purpose**: Core agent execution function
- **Exports**: `executeAgent({ executionId, agentType, promptContext, userId, correlationId, requestId })`
- **Calls**: governance checks → Anthropic API → output validation → DB persist
- **Used by**: queue/workers.ts

### `src/lib/agents/prompts.ts`
- **Purpose**: Static prompt definitions for all agent types
- **Exports**: `AgentType`, `getAgentSystemPrompt(type)`, `buildAgentUserPromptTemplate(type)`
- **Agent types**: `resume-tailor`, `job-match`, `interview-prep`, `research`, `follow-up`, `networking`

### `src/lib/agents/store.ts`
- **Purpose**: Event log persistence and execution envelope retrieval
- **Exports**: `appendExecutionLog(...)`, `getExecutionEnvelope(executionId)`
- **Used by**: queue/workers.ts, API routes

### `src/lib/agent/agentService.ts`
- **Purpose**: Frontend API client for agent operations
- **Exports**: `getAgentExecution`, `getAgentLogs`, `pauseAgentExecution`, `resumeAgentExecution`, `cancelAgentExecution`, `subscribeToAgentExecution`, `pollAgentExecution`
- **Note**: Client-side module — fetches from API routes

## Governance Modules

### `src/lib/governance/policyEngine.ts`
- **Purpose**: Per-agent-type policy definitions and enforcement
- **Exports**: `AgentPolicy`, `AGENT_POLICIES`, `getPolicy(agentType)`, `checkExecutionPolicy(agentType, opts)`, `estimateCostUsd(provider, modelId, inputTokens, outputTokens)`
- **Policies**: max tokens, cost, retries, fallback depth, allowed tools, context size, PII handling, TTL, concurrency

### `src/lib/governance/promptRegistry.ts`
- **Purpose**: Versioned prompt storage with canary routing and rollback
- **Exports**: `getActivePromptVersion(agentType)`, `registerPromptVersion(opts)`, `rollbackPromptVersion(agentType, version)`, `listPromptVersions(agentType)`, `diffPromptVersions(a, b)`, `hashPrompt(text)`
- **Storage**: `PromptVersion` Prisma table
- **Canary**: Routes by `canaryPercent` field; stable version wins by default

### `src/lib/governance/outputValidator.ts`
- **Purpose**: Three-layer LLM output validation pipeline
- **Exports**: `validateAgentOutput(agentType, rawOutput)` → `ValidationResult`
- **Layers**: schema (Zod) → semantic (heuristics) → policy (fabrication/manipulation patterns) → normalization
- **Schema versions**: per-agent Zod schemas for all 6 agent types

### `src/lib/governance/hallucinationControls.ts`
- **Purpose**: Pattern-based hallucination and prompt-injection detection
- **Exports**: `inspectForHallucinations(agentType, output, inputContext?)`, `inspectInputForInjection(userInput)`
- **Detects**: fabricated salary ranges, internal knowledge claims, prompt injection sequences, manipulative language, PII exposure, unsupported statistics

### `src/lib/governance/boundedExecution.ts`
- **Purpose**: TTL enforcement, recursion prevention, concurrency governance
- **Exports**: `ExecutionBoundary`, `createExecutionBoundary(opts)`, `deriveChildBoundary(parent, childId)`, `assertBoundaryAllowsChild(boundary, childId, tokens?)`, `runWithBoundary(boundary, fn)`, `isBoundaryExpired(boundary)`
- **Error types**: `RecursionDepthError`, `CircularExecutionError`, `TtlExpiredError`, `TokenBudgetExhaustedError`

### `src/lib/governance/multiAgentCoordination.ts`
- **Purpose**: Coordination primitives for multi-agent workflows
- **Exports**: Multi-agent orchestration types and functions

### `src/lib/governance/providerQualification.ts`
- **Purpose**: Provider capability declarations and qualification gates

### `src/lib/governance/regressionHarness.ts`
- **Purpose**: Regression test harness for prompt version changes

## Queue Modules

### `src/lib/queue/queues.ts`
- **Purpose**: BullMQ Queue instances and enqueue helpers
- **Exports**: `getExecutionQueue()`, `getDeadLetterQueue()`, `enqueueExecution(data)`, `enqueueDeadLetter(payload)`, `getQueueMetrics()`, `closeQueues()`
- **Queues**: `agent-execution` (primary), `agent-execution-dlq` (dead-letter)

### `src/lib/queue/workers.ts`
- **Purpose**: BullMQ Worker that processes agent executions
- **Exports**: `createExecutionWorker()`, `startExecutionWorker()`, `closeExecutionWorker()`, `getWorkerHeartbeat()`
- **Behavior**: acquires concurrency slot → executeAgent() → releases slot; on failure: classifies error → DLQ if exhausted

### `src/lib/queue/retry-policy.ts`
- **Purpose**: Retry configuration and non-retryable error sentinel
- **Exports**: `createQueueJobOptions(opts?)`, `ConcurrencyLimitError`, `NonRetryableExecutionError`

### `src/lib/queue/concurrency.ts`
- **Purpose**: Redis-backed per-user execution slot management
- **Exports**: `acquireExecutionSlots(userId, agentType, executionId)`, `releaseExecutionSlots(...)`

### `src/lib/queue/dead-letter.ts`
- **Purpose**: Dead-letter queue definition and payload type
- **Exports**: `createDeadLetterQueue(connection)`, `DeadLetterPayload`

### `src/lib/queue/events.ts`
- **Purpose**: Redis pub/sub event publisher for real-time updates
- **Exports**: `publishRealtimeEvent(userId, event)`

### `src/lib/queue/scheduler.ts`
- **Purpose**: BullMQ Scheduler — stale execution cleanup, scheduled jobs
- **Exports**: `startQueueScheduler()`, cleanup interval from `runtimeSettings.schedulerCleanupIntervalMs`

### `src/lib/queue/payload.ts`
- **Purpose**: Queue payload sanitization (size capping, PII scrubbing)
- **Exports**: `sanitizeQueuePayload(data)`

## Observability Modules

### `src/lib/observability/metrics.ts`
- **Purpose**: In-process operational metrics store
- **Exports**: `recordQueueMetric`, `recordWorkerExecution`, `recordWorkerRetry`, `recordProviderExecution`, `recordProviderRetry`, `recordProviderCircuitOpen`, `incrementConcurrency`, `decrementConcurrency`, `incrementSseStreams`, `decrementSseStreams`, `updateDlqDepth`, `getMetricsSnapshot()`
- **Tracks**: queue/worker/provider counts, p50/p95/p99 latencies, concurrency gauge, SSE gauge, DLQ depth

### `src/lib/observability/provider-health.ts`
- **Purpose**: Sliding-window provider degradation scoring
- **Exports**: `recordProviderObservation`, `getProviderHealthReport(providerId)`, `getAllProviderHealthReports()`, `hasProviderDegradation()`
- **Score bands**: 0–20 healthy, 21–50 warning, 51–80 degraded, 81–100 critical

### `src/lib/observability/tracing.ts`
- **Purpose**: Lightweight trace span tracking
- **Exports**: `startTraceSpan(name, attrs)` → span with `end(attrs)`, `addEvent(name, attrs)`

### `src/lib/observability/failure-classification.ts`
- **Purpose**: Classify errors as retryable/non-retryable with type tags
- **Exports**: `classifyError(error, context)` → `{ failureType, retryable }`

### `src/lib/observability/cost-analytics.ts`
- **Purpose**: Per-agent-type token and cost aggregation

### `src/lib/observability/alerts.ts`
- **Purpose**: Alert rule evaluation against metrics snapshot

### `src/lib/observability/replay.ts`
- **Purpose**: DLQ job replay orchestration

## Real-Time Modules

### `src/lib/realtime/sharedSubscriber.ts`
- **Purpose**: Redis subscriber that forwards events to registered SSE handlers
- **Exports**: `subscribeToExecution(executionId, callback)` → unsubscribe fn

### `src/lib/realtime/agentStatusBroadcaster.ts`
- **Purpose**: Broadcast agent status changes to connected SSE clients

## Security Modules

### `src/lib/security/twoFactor.ts`
- **Purpose**: TOTP 2FA using speakeasy
- **Exports**: setup, verify, enable functions

### `src/lib/security/apiKey.ts`
- **Purpose**: API key generation, hashing, validation
- **Exports**: `generateApiKey()`, `hashApiKey(key)`, `validateApiKey(key)`

## Last Updated
2026-05-27
