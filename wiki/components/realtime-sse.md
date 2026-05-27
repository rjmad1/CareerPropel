# Real-Time SSE

## Purpose

Server-Sent Events (SSE) transport for streaming agent execution updates to browser clients. SSE replaced WebSocket as the canonical real-time channel (commit `8754c84`).

## Responsibilities

- Stream execution state changes to connected browser clients
- Forward Redis pub/sub events to per-execution SSE streams
- Maintain heartbeat on idle streams
- Track active stream count for observability
- Handle clean disconnect and cleanup

## Dependencies

- `ioredis` — Redis pub/sub subscriber
- `src/lib/agents/store` — execution envelope fetch
- `src/lib/runtime/settings` — heartbeat interval
- `src/lib/observability/metrics` — SSE stream gauge

## Public Interfaces

### SSE Endpoint

```
GET /api/agent/execution/[executionId]/subscribe
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

Returns a `ReadableStream` of SSE events. The client must have EventSource support (all modern browsers).

### Shared Subscriber (`sharedSubscriber.ts`)

```typescript
subscribeToExecution(
  executionId: string,
  callback: (event: RealtimeEvent) => Promise<void>
): Promise<() => void>  // returns unsubscribe function
```

Maintains a shared Redis subscriber connection. Multiple SSE streams can subscribe to the same execution.

### Agent Status Broadcaster (`agentStatusBroadcaster.ts`)

```typescript
broadcastAgentStatus(userId: string, event: AgentStatusEvent): Promise<void>
```

Used by the global SSE feed at `/live`.

## SSE Event Format

```
event: execution:update
data: {"id":"...","status":"running","progress":50,...}

event: log:new
data: {"id":"...","level":"INFO","message":"...","timestamp":"..."}

event: heartbeat
data: {"executionId":"...","timestamp":"..."}
```

Auto-reconnect: `retry: 5000` is sent at stream open (5-second reconnect interval).

## Event Types

| Event | When Emitted | Payload |
|---|---|---|
| `execution:update` | On any state change (start, progress, complete) | Full execution envelope |
| `execution:queued` | Job accepted by API | `{ executionId, status: 'queued' }` |
| `execution:started` | Worker picks up job | `{ executionId, status: 'running' }` |
| `execution:completed` | Agent finishes | `{ executionId, status: 'completed' }` |
| `execution:failed` | Job exhausts retries | `{ executionId, status: 'failed' }` |
| `log:new` | Event log appended | Single `EventLog` record |
| `toolcall:complete` | Tool call finishes | `ToolCall` record |
| `heartbeat` | Every 15s on idle stream | `{ executionId, timestamp }` |

## Internal Flow

```
Client connects: GET /api/agent/execution/[id]/subscribe

1. Validate execution exists in DB
2. Create ReadableStream
3. Send: retry: 5000\n\n
4. Send: current execution state (execution:update)
5. subscribeToExecution(executionId, handler):
   - Redis SUB on execution-specific channel
   - handler: log:new → forward raw; others → re-fetch DB → execution:update
6. setInterval(heartbeat, 15_000)
7. request.signal.abort → close stream + unsubscribe

Publisher side (in Worker):
  publishRealtimeEvent(userId, event)
    → Redis PUBLISH to user+execution channel
    → sharedSubscriber receives → calls registered handlers
    → handlers encode SSE events → ReadableStream.enqueue()
```

## Configuration

| Env Var | Default | Purpose |
|---|---|---|
| `SSE_HEARTBEAT_MS` | 15000 | Heartbeat interval (ms) |

## Failure Modes

| Failure | Behavior |
|---|---|
| Client disconnects | `request.signal.abort` fires; stream closed; Redis subscriber removed |
| Redis pub/sub failure | Events not delivered; client waits for heartbeat; reconnects after 5s |
| Worker process crashes | Last known state visible via initial `execution:update`; no further events until worker recovers |
| Execution not found | HTTP 404; no stream opened |

## Observability

- `incrementSseStreams()` on stream open; `recordSseDisconnect()` on close
- `recordSseHeartbeatFailure()` if heartbeat enqueue throws
- Active stream count in `GET /api/ops/metrics` → `sse.activeStreams`

## Client Usage (Frontend)

The `subscribeToAgentExecution` function in `src/lib/agent/agentService.ts` wraps `EventSource`:

```typescript
const unsubscribe = subscribeToAgentExecution(
  executionId,
  (event) => {
    if (event.type === 'execution:update') { /* update UI */ }
    if (event.type === 'log:new') { /* append log */ }
  },
  (error) => { /* handle error */ }
)

// Cleanup:
unsubscribe()
```

Polling fallback (`pollAgentExecution`) available when EventSource unavailable.

React hook: `src/hooks/useAgentRealTime.ts` manages the subscription lifecycle.

## Security Considerations

- Execution ID in URL should be validated against the requesting user's ownership
- No authentication check on the SSE endpoint in current implementation

## Validation Required

The following behavior could not be fully verified from static analysis:
- Whether per-user subscription isolation is enforced (could a user subscribe to another user's execution?)

## Related Components

- [Agent System](agent-system.md)
- [Queue Infrastructure](queue-infrastructure.md)

## Last Updated
2026-05-27
