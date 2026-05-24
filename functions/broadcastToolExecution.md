[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastToolExecution

# Function: broadcastToolExecution()

> **broadcastToolExecution**(`userId`, `agentType`, `executionId`, `toolName`, `status`, `duration`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:92](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/realtime/agentStatusBroadcaster.ts#L92)

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
