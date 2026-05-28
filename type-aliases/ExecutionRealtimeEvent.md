[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ExecutionRealtimeEvent

# Type Alias: ExecutionRealtimeEvent

> **ExecutionRealtimeEvent** = \{ `agentType`: `string`; `correlationId?`: `string` \| `null`; `currentTask?`: `string`; `executionId`: `string`; `queueJobId?`: `string` \| `null`; `requestId?`: `string` \| `null`; `status`: `"queued"` \| `"running"` \| `"completed"` \| `"failed"`; `timestamp`: `string`; `type`: `"execution:queued"` \| `"execution:started"` \| `"execution:completed"` \| `"execution:failed"`; `userId`: `string`; \} \| \{ `agentType`: `string`; `confidence?`: `number`; `correlationId?`: `string` \| `null`; `currentTask?`: `string`; `executionId`: `string`; `progress`: `number`; `queueDepth?`: `number`; `requestId?`: `string` \| `null`; `status`: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"paused"`; `timestamp`: `string`; `tokensUsed?`: `number`; `type`: `"execution:status"`; `userId`: `string`; \} \| \{ `agentType`: `string`; `executionId`: `string`; `log`: `EventLog`; `timestamp`: `string`; `type`: `"log:new"`; `userId`: `string`; \}

Defined in: [src/lib/queue/events.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/queue/events.ts#L12)
