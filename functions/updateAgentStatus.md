[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateAgentStatus

# Function: updateAgentStatus()

> **updateAgentStatus**(`userId`, `agentType`, `status`, `queueDepth`, `currentTask?`, `tokensUsed?`, `confidence?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:121](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/agentStatusBroadcaster.ts#L121)

Update agent status in cache and broadcast

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

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
