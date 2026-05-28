[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentCompleted

# Function: broadcastAgentCompleted()

> **broadcastAgentCompleted**(`userId`, `agentType`, `executionId`, `jobId`, `status`, `output`, `error`, `tokensUsed`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:51](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/agentStatusBroadcaster.ts#L51)

Broadcast that an agent has completed

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

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
