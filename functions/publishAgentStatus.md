[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStatus

# Function: publishAgentStatus()

> **publishAgentStatus**(`userId`, `_executionId`, `agentType`, `executionStatus`, `queueDepth?`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:148](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/agents/redis-integration.ts#L148)

Publish agent status update to Redis

## Parameters

### userId

`string`

### \_executionId

`string`

### agentType

[`ExtendedAgentType`](../type-aliases/ExtendedAgentType.md)

### executionStatus

`"completed"` \| `"queued"` \| `"running"` \| `"failed"` \| `"paused"`

### queueDepth?

`number` = `0`

### currentTask?

`string`

### tokensUsed?

`number`

### confidence?

`number`

## Returns

`Promise`\<`void`\>
