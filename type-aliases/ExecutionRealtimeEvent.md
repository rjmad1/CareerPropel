[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ExecutionRealtimeEvent

# Type Alias: ExecutionRealtimeEvent

> **ExecutionRealtimeEvent** = \{ `agentType`: `string`; `correlationId?`: `string` \| `null`; `currentTask?`: `string`; `executionId`: `string`; `queueJobId?`: `string` \| `null`; `requestId?`: `string` \| `null`; `status`: `"queued"` \| `"running"` \| `"completed"` \| `"failed"`; `timestamp`: `string`; `type`: `"execution:queued"` \| `"execution:started"` \| `"execution:completed"` \| `"execution:failed"`; `userId`: `string`; \} \| \{ `agentType`: `string`; `confidence?`: `number`; `correlationId?`: `string` \| `null`; `currentTask?`: `string`; `executionId`: `string`; `progress`: `number`; `queueDepth?`: `number`; `requestId?`: `string` \| `null`; `status`: `"queued"` \| `"running"` \| `"completed"` \| `"failed"` \| `"paused"`; `timestamp`: `string`; `tokensUsed?`: `number`; `type`: `"execution:status"`; `userId`: `string`; \} \| \{ `agentType`: `string`; `executionId`: `string`; `log`: `EventLog`; `timestamp`: `string`; `type`: `"log:new"`; `userId`: `string`; \}

Defined in: [src/lib/queue/events.ts:12](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/queue/events.ts#L12)
