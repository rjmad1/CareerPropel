[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastAgentCompleted

# Function: broadcastAgentCompleted()

> **broadcastAgentCompleted**(`userId`, `agentType`, `executionId`, `jobId`, `status`, `output`, `error`, `tokensUsed`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:52](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/agentStatusBroadcaster.ts#L52)

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
