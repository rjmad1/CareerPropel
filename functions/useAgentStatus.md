[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentStatus

# Function: useAgentStatus()

> **useAgentStatus**(`autoConnect?`): `object`

Defined in: [src/hooks/useAgentStatus.ts:22](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/hooks/useAgentStatus.ts#L22)

## Parameters

### autoConnect?

`boolean` = `true`

## Returns

### agents

> **agents**: `AgentStateMap`

### connect

> **connect**: () => `void`

Connect to WebSocket server

#### Returns

`void`

### disconnect

> **disconnect**: () => `void`

Disconnect from WebSocket

#### Returns

`void`

### error

> **error**: `string` \| `null`

### getAgentStatus

> **getAgentStatus**: (`agentType`) => [`AgentStatusEvent`](../interfaces/AgentStatusEvent.md)

Get specific agent status

#### Parameters

##### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

#### Returns

[`AgentStatusEvent`](../interfaces/AgentStatusEvent.md)

### getAllAgents

> **getAllAgents**: () => `AgentStateMap`

Get all agents

#### Returns

`AgentStateMap`

### isConnected

> **isConnected**: `boolean`
