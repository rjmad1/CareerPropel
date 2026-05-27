[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateAgentStatus

# Function: updateAgentStatus()

> **updateAgentStatus**(`userId`, `agentType`, `status`, `queueDepth`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:120](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/agentStatusBroadcaster.ts#L120)

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
