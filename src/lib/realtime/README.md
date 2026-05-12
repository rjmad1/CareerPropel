# Real-Time Agent Status System (WebSocket + Redis Pub/Sub)

## Architecture Overview

The real-time agent status system enables live updates of agent execution state to connected clients via WebSocket, backed by Redis pub/sub for scalability.

```
┌─────────────────┐
│  Agent (Node)   │
│  Resume Tailor  │
└────────┬────────┘
         │
         │ publishEvent()
         │
    ┌────▼─────┐
    │   Redis  │
    │  Pub/Sub │
    └────┬─────┘
         │
    ┌────┴──────────────┬──────────────┬─────────────┐
    │                   │              │             │
    │         Agent Status Channel     │             │
    │         Agent Executions Channel │             │
    │         Queue Stats Channel      │             │
    │
    ▼
┌─────────────────────┐
│  WebSocket Server   │
│  /api/ws (GET)      │
└────────┬────────────┘
         │
         │ broadcastToUser()
         │
    ┌────┴────────────────────────┐
    │                             │
    ▼                             ▼
┌──────────────┐          ┌──────────────┐
│  Client 1    │          │  Client 2    │
│  Browser A   │          │  Browser B   │
│ useAgentStatus│         │ useAgentStatus│
└──────────────┘          └──────────────┘
```

## Components

### 1. Event Types (`events.ts`)

Defines all event types that can flow through the real-time system:
- `AgentStatusEvent` - Agent status changes (idle, running, error, completed)
- `ToolExecutionEvent` - Individual tool executions
- `AgentStartedEvent` - Agent begins work
- `AgentCompletedEvent` - Agent finishes
- `QueueStatsEvent` - Queue throughput stats
- `ErrorEvent` - System errors
- `HeartbeatEvent` - Keep-alive pings

Redis channels:
```
agent:status:USER_ID              → AgentStatusEvent
agent:executions:USER_ID          → ToolExecutionEvent, AgentStartedEvent, AgentCompletedEvent
queue:stats:USER_ID               → QueueStatsEvent
system:errors                     → ErrorEvent
system:heartbeat                  → HeartbeatEvent
```

### 2. WebSocket Server (`wsServer.ts`)

Manages in-memory WebSocket connections and Redis subscriptions:
- `subscribeToAgentUpdates()` - Subscribe client to agent events
- `unsubscribeClient()` - Clean up connection
- `broadcastToUser()` - Send event to all connections for a user
- `getAgentStatus()` - Fetch latest agent status from Redis cache
- `sendHeartbeats()` - Keep-alive pings
- `cleanupStaleConnections()` - Remove dead connections

### 3. WebSocket Route (`/api/ws`)

HTTP endpoint for WebSocket upgrade:
- Authenticates user from JWT/cookies
- Generates unique client ID
- Calls `subscribeToAgentUpdates()`
- Sends initial agent state to client
- Returns WebSocket response with upgrade headers

### 4. Agent Status Broadcaster (`agentStatusBroadcaster.ts`)

Service for agents to publish status updates:
- `broadcastAgentStarted()` - Publish agent execution started
- `broadcastAgentCompleted()` - Publish agent execution completed
- `broadcastToolExecution()` - Publish tool execution
- `updateAgentStatus()` - Update agent status in Redis
- `setAgentRunning()` / `setAgentIdle()` / `setAgentError()`
- `broadcastQueueStats()` - Publish queue statistics

### 5. React Hook (`useAgentStatus.ts`)

Client-side hook for consuming real-time updates:
- `useAgentStatus()` - Main hook, manages WebSocket connection
- `useAgentStatusListener()` - Hook for listening to specific agent

## Usage Examples

### Server-side: Publish agent status update

```typescript
import { broadcastAgentStarted, broadcastAgentCompleted, setAgentRunning } from '@/lib/realtime/agentStatusBroadcaster';

// Agent starts work
await broadcastAgentStarted(
  userId,
  'resume_tailor',
  executionId,
  jobId,
  { resume: resumeId, jobDescription: jobDesc }
);

// Agent is running
await setAgentRunning(userId, 'resume_tailor', 3, 'Tailoring resume section 2/5');

// Agent completes
await broadcastAgentCompleted(
  userId,
  'resume_tailor',
  executionId,
  jobId,
  'success',
  { tailoredResume: newResumeId, changes: [...] },
  undefined,
  1250, // tokensUsed
  45000  // duration in ms
);
```

### Client-side: Subscribe to agent updates

```typescript
'use client';

import { useAgentStatus, useAgentStatusListener } from '@/hooks/useAgentStatus';

function AgentDashboard() {
  const { agents, isConnected, error } = useAgentStatus();

  return (
    <div>
      {isConnected ? '✓ Connected' : '✗ Disconnected'}
      {error && <div className="error">{error}</div>}
      
      {Object.entries(agents).map(([type, status]) => (
        <div key={type}>
          <strong>{type}</strong>: {status.status}
          <progress value={status.queueDepth} />
        </div>
      ))}
    </div>
  );
}

function ResumeTailorStatus() {
  const { status, isRunning, queueDepth } = useAgentStatusListener('resume_tailor');

  if (!status) return <div>No resume tailor status</div>;

  return (
    <div>
      Status: {status.status}
      Queue: {queueDepth} jobs
      Current: {status.currentTask || 'idle'}
    </div>
  );
}
```

## Data Flow Example: Resume Tailoring

1. **User triggers resume tailoring** → API calls `broadcastAgentStarted()`
2. **Resume Tailor agent executes**:
   - Calls `setAgentRunning()` as it begins work
   - Calls `broadcastToolExecution()` for each tool call
   - Calls `broadcastAgentCompleted()` when done
3. **Redis pub/sub publishes events** to `agent:executions:USER_ID`
4. **WebSocket server receives** from Redis and calls `broadcastToUser()`
5. **Client WebSocket receives** via `onmessage` and updates state
6. **React component re-renders** with latest status

## Performance Considerations

- **Redis**: O(1) pub/sub operations, scales to thousands of subscribers
- **WebSocket**: Persistent connections, minimal overhead after handshake
- **Heartbeats**: Sent every 30 seconds to detect dead connections
- **Stale cleanup**: Runs every 5 minutes to remove idle connections
- **Caching**: Latest agent status cached in Redis for new clients

## Error Handling

- **Connection lost**: Client auto-reconnects with exponential backoff
- **Message parse error**: Logged but doesn't crash connection
- **Stale client**: Removed after 15 minutes of no heartbeat
- **Redis error**: Logged, connection continues (events may be lost)
- **Authentication failure**: WebSocket upgrade denied

## Testing

TODO: Add Cypress tests for WebSocket behavior
- Connect/disconnect
- Receive status updates
- Auto-reconnect on disconnect
- Error recovery

## Future Enhancements

- [ ] Message queuing if client temporarily disconnects
- [ ] Batching of multiple events into single message
- [ ] Event filtering (client subscribes to specific agents only)
- [ ] Compression of message payloads
- [ ] Metrics collection (connection count, message throughput)
- [ ] Dead-letter queue for failed broadcasts
