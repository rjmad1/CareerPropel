[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentStarted

# Function: broadcastAgentStarted()

> **broadcastAgentStarted**(`userId`, `agentType`, `executionId`, `jobId`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:22](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/agentStatusBroadcaster.ts#L22)

Broadcast that an agent has started execution

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

### executionId

`string`

### jobId

`string` \| `undefined`

### input

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<`void`\>
