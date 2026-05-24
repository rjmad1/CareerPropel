[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastToolExecution

# Function: broadcastToolExecution()

> **broadcastToolExecution**(`userId`, `agentType`, `executionId`, `toolName`, `status`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:92](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/agentStatusBroadcaster.ts#L92)

Broadcast a tool execution event

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

### executionId

`string`

### toolName

`string`

### status

`"pending"` \| `"success"` \| `"failed"`

### duration

`number`

## Returns

`Promise`\<`void`\>
