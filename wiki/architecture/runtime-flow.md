# Runtime Flow

## Purpose

Step-by-step walkthrough of the two primary runtime flows: agent execution and real-time streaming.

## Flow 1 — Agent Execution Lifecycle

### Phase 1: Request Intake (Web Process)

```
Client → POST /api/agents/execute
         body: { agentType, context, jobId? }
```

1. **Rate limit check** — `createRateLimiter(20, 60000)` — 20 req/min per IP
2. **Auth** — `getCurrentUser(request)` resolves session user; falls back to `x-user-id` header
3. **Validation** — `agentType` must be in the valid set of 6 types
4. **Payload sanitize** — `sanitizeQueuePayload(context)` caps size, scrubs PII
5. **Create execution record** — `prisma.agentExecution.create({ status: 'queued' })` with `requestId` and `correlationId`
6. **Log initial event** — `appendExecutionLog(..., 'INFO', 'Agent execution queued')`
7. **Enqueue** — `enqueueExecution(data)` → BullMQ `agent-execution` queue
8. **Update DB** — store `queueJobId` on execution record
9. **Publish SSE event** — `publishRealtimeEvent(userId, { type: 'execution:queued' })`
10. **Return** — `{ executionId, queueJobId, status: 'queued' }`

### Phase 2: Worker Processing (Worker Process)

```
BullMQ dequeues job → processExecution(job)
```

1. **Trace span** — `startTraceSpan('queue.execute-agent', { executionId, ... })`
2. **Concurrency guard** — `acquireExecutionSlots(userId, agentType, executionId)` — Redis-backed; throws `ConcurrencyLimitError` if at limit → BullMQ retries
3. **Update DB** — `queueJobId`, `attempts`, `correlationId`, `requestId`
4. **Publish started** — `{ type: 'execution:started', status: 'running' }`
5. **Execute with timeout** — `withTimeout(executeAgent(...), runtimeSettings.executionTimeoutMs)` (default 15 min)
6. **Record metrics** — `recordQueueMetric(...)`, `recordWorkerExecution(...)`
7. **Release slot** — `releaseExecutionSlots(userId, agentType, executionId)` in `finally`

### Phase 3: Agent Execution (Inside `executeAgent`)

```
executeAgent({ executionId, agentType, promptContext, userId, ... })
```

1. **Get prompt version** — `getActivePromptVersion(agentType)` → database; seeds `v1.0.0` if none exists; supports canary routing via `canaryPercent`
2. **Policy check** — `checkExecutionPolicy(agentType, { inputChars, concurrentCount })` → violations → abort if blocked
3. **Build prompt** — interpolate `userPromptTemplate` with `promptContext`
4. **Call LLM** — Anthropic Claude SDK; model from provider qualification
5. **Parse response** — extract JSON from Claude output
6. **Validate output** — `validateAgentOutput(agentType, parsed)`:
   - Layer 1: Zod schema validation
   - Layer 2: Semantic heuristics (plausibility, suspicious patterns)
   - Layer 3: Policy patterns (fabrication, manipulation)
   - Layer 4: Normalization (trim strings, clamp numeric ranges)
7. **Hallucination scan** — `inspectForHallucinations(agentType, output, inputContext)` — checks prompt injection, PII, fabricated salary, internal knowledge claims
8. **Persist** — update `AgentExecution` with output, tokenCount, cost, validation flags, promptVersionId
9. **Publish completed** — `{ type: 'execution:completed' }`

### Phase 4: Failure Path

On worker job failure after max retries (`queueAttempts` default 4):

1. `classifyError(error, context)` → `{ failureType, retryable }`
2. If `retryable=false`: throw `NonRetryableExecutionError` — BullMQ won't retry
3. If exhausted: `enqueueDeadLetter(payload)` → `agent-execution-dlq` queue
4. `publishRealtimeEvent({ type: 'execution:failed' })`
5. Update `AgentExecution.status = 'failed'`, `errorMessage`

---

## Flow 2 — Real-Time SSE Streaming

### Connection Setup

```
Client → GET /api/agent/execution/[executionId]/subscribe
```

1. **Verify execution exists** — `prisma.agentExecution.findUnique(executionId)`
2. **Create ReadableStream** with encoder
3. **Send retry hint** — `retry: 5000\n\n` (5s auto-reconnect)
4. **Send current state** — `getExecutionEnvelope(executionId)` → `execution:update` event
5. **Subscribe** — `subscribeToExecution(executionId, handler)`:
   - Redis subscriber listens on per-execution channel
   - `log:new` events forwarded directly
   - Other events trigger fresh DB read → `execution:update`
6. **Heartbeat** — every `sseHeartbeatMs` (default 15s) emit `{ type: 'heartbeat' }`
7. **Cleanup** — on `request.signal.abort` → close stream, unsubscribe Redis

### SSE Event Types

| Event | Payload |
|---|---|
| `execution:update` | Full execution envelope (status, progress, toolCalls, logs) |
| `execution:queued` | Initial queued notification |
| `execution:started` | Worker picked up job |
| `execution:completed` | Agent finished successfully |
| `execution:failed` | Agent failed permanently |
| `log:new` | Single EventLog record |
| `toolcall:complete` | ToolCall record update |
| `heartbeat` | `{ executionId, timestamp }` |

---

## Flow 3 — Scheduler (Scheduler Process)

```
startQueueScheduler()
  → repeating job every schedulerCleanupIntervalMs (default 5 min)
  → scan AgentExecution for stale 'running' records beyond TTL
  → update status to 'failed', record error
  → sweep DLQ for replayable items
```

## Related

- [Agent System](../components/agent-system.md)
- [Queue Infrastructure](../components/queue-infrastructure.md)
- [Governance Layer](../components/governance.md)
- [Real-Time SSE](../components/realtime-sse.md)

## Last Updated
2026-05-27
