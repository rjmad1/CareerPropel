[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishAgentStatus

# Function: publishAgentStatus()

> **publishAgentStatus**(`userId`, `_executionId`, `agentType`, `executionStatus`, `queueDepth?`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/agents/redis-integration.ts:127](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/agents/redis-integration.ts#L127)

Publish agent status update to Redis

## Parameters

### userId

`string`

### \_executionId

`string`

### agentType

[`ExtendedAgentType`](../type-aliases/ExtendedAgentType.md)

### executionStatus

`"running"` \| `"completed"` \| `"failed"` \| `"queued"` \| `"paused"`

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
