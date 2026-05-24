[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentCompleted

# Function: broadcastAgentCompleted()

> **broadcastAgentCompleted**(`userId`, `agentType`, `executionId`, `jobId`, `status`, `output`, `error`, `tokensUsed`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:52](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/realtime/agentStatusBroadcaster.ts#L52)

Broadcast that an agent has completed

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

### executionId

`string`

### jobId

`string` \| `undefined`

### status

`"success"` \| `"failed"`

### output

`Record`\<`string`, `unknown`\> \| `undefined`

### error

`string` \| `undefined`

### tokensUsed

`number`

### duration

`number`

## Returns

`Promise`\<`void`\>
