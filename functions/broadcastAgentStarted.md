[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentStarted

# Function: broadcastAgentStarted()

> **broadcastAgentStarted**(`userId`, `agentType`, `executionId`, `jobId`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:22](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/agentStatusBroadcaster.ts#L22)

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
