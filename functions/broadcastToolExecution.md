[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastToolExecution

# Function: broadcastToolExecution()

> **broadcastToolExecution**(`userId`, `agentType`, `executionId`, `toolName`, `status`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:91](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/agentStatusBroadcaster.ts#L91)

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
