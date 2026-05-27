[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateAgentStatus

# Function: updateAgentStatus()

> **updateAgentStatus**(`userId`, `agentType`, `status`, `queueDepth`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:120](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/agentStatusBroadcaster.ts#L120)

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
