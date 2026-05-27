[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentStarted

# Function: broadcastAgentStarted()

> **broadcastAgentStarted**(`userId`, `agentType`, `executionId`, `jobId`, `input`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:22](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/agentStatusBroadcaster.ts#L22)

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
