# Real-Time Agent Execution System (SSE + Redis Pub/Sub)

## Architecture Overview

Execution updates stream to clients via Server-Sent Events (SSE), backed by a shared Redis pub/sub subscriber per process.

```
Worker Runtime
  │ publishRealtimeEvent()
  │
  ▼
Redis Pub/Sub
  │ pattern: agent-events:{userId}
  │
  ▼
Shared Subscriber (one per web process)
  │ local EventEmitter fanout
  │
  ├──► SSE Client 1 (GET /api/agent/execution/{id}/subscribe)
  └──► SSE Client 2 (GET /api/agent/execution/{id}/subscribe)
```

WebSocket transport has been removed. The deprecated `/api/ws` and `/api/agents/ws` routes returned 410 Gone and have been deleted.

## Components

### `events.ts`

Event type definitions for the execution event spine:
- `AgentStatusEvent` — agent status changes (idle, running, error, completed)
- `ToolExecutionEvent` — tool invocations
- `AgentStartedEvent` / `AgentCompletedEvent`
- `HeartbeatEvent` — keep-alive pings (every 30 s)

### `sharedSubscriber.ts`

Singleton Redis subscriber per process. Subscribes once with `psubscribe agent-events:*` and fans events out to local EventEmitter listeners. Prevents per-client Redis subscriptions from multiplying connections.

### `agentStatusBroadcaster.ts`

Server-side publisher API used by the worker runtime to emit execution state changes. Events flow through Redis pub/sub to the shared subscriber and then to SSE streams.

## SSE Endpoint

```
GET /api/agent/execution/[executionId]/subscribe
Content-Type: text/event-stream
```

Events:
- `event: execution:update` — execution state change
- `event: log:new` — individual log line
- `event: heartbeat` — keep-alive ping

## Client-Side Usage

Use `useAgentExecution` with SSE enabled for per-execution real-time state:

```typescript
import { useAgentExecution } from '@/hooks/useAgentExecution';

function ExecutionView({ executionId }: { executionId: string }) {
  const { execution, logs, isRunning } = useAgentExecution(executionId, {
    autoSubscribe: true,
    useSse: true,
  });

  return <div>{execution?.status}</div>;
}
```

For aggregate agent status (e.g. AgentRail), use `useAgentRealTime` which polls via REST.
