[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStatus

# Function: publishAgentStatus()

> **publishAgentStatus**(`userId`, `_executionId`, `agentType`, `executionStatus`, `queueDepth?`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:148](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/agents/redis-integration.ts#L148)

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
