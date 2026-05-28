[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateAgentStatus

# Function: updateAgentStatus()

> **updateAgentStatus**(`userId`, `agentType`, `status`, `queueDepth`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:120](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/agentStatusBroadcaster.ts#L120)

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
