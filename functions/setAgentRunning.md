[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / setAgentRunning

# Function: setAgentRunning()

> **setAgentRunning**(`userId`, `agentType`, `queueDepth?`, `currentTask?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:163](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/agentStatusBroadcaster.ts#L163)

Set agent to running with optional queue depth

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

### queueDepth?

`number` = `0`

### currentTask?

`string`

## Returns

`Promise`\<`void`\>
