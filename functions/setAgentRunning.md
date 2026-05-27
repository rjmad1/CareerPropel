[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / setAgentRunning

# Function: setAgentRunning()

> **setAgentRunning**(`userId`, `agentType`, `queueDepth?`, `currentTask?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:162](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/realtime/agentStatusBroadcaster.ts#L162)

Set agent to running with optional queue depth

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

### queueDepth?

`number` = `0`

### currentTask?

`string`

## Returns

`Promise`\<`void`\>
