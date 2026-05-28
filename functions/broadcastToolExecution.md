[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastToolExecution

# Function: broadcastToolExecution()

> **broadcastToolExecution**(`userId`, `agentType`, `executionId`, `toolName`, `status`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:91](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/agentStatusBroadcaster.ts#L91)

Broadcast a tool execution event

## Parameters

### userId

`string`

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

### executionId

`string`

### toolName

`string`

### status

`"success"` \| `"failed"` \| `"pending"`

### duration

`number`

## Returns

`Promise`\<`void`\>
