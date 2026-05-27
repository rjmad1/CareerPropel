[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateAgentStatus

# Function: updateAgentStatus()

> **updateAgentStatus**(`userId`, `agentType`, `status`, `queueDepth`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:120](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/agentStatusBroadcaster.ts#L120)

Update agent status in cache and broadcast

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

### status

[`AgentStatus`](../type-aliases/AgentStatus.md)

### queueDepth

`number`

### currentTask?

`string`

### tokensUsed?

`number`

### confidence?

`number`

## Returns

`Promise`\<`void`\>
