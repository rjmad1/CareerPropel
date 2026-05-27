[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentCompleted

# Function: broadcastAgentCompleted()

> **broadcastAgentCompleted**(`userId`, `agentType`, `executionId`, `jobId`, `status`, `output`, `error`, `tokensUsed`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:51](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/agentStatusBroadcaster.ts#L51)

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
