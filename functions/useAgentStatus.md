[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentStatus

# Function: useAgentStatus()

> **useAgentStatus**(`autoConnect?`): `object`

Defined in: [src/hooks/useAgentStatus.ts:22](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/hooks/useAgentStatus.ts#L22)

## Parameters

### autoConnect?

`boolean` = `true`

## Returns

`object`

### agents

> **agents**: `AgentStateMap`

### connect

> **connect**: () => `void`

#### Returns

`void`

### disconnect

> **disconnect**: () => `void`

#### Returns

`void`

### error

> **error**: `string` \| `null`

### getAgentStatus

> **getAgentStatus**: (`agentType`) => [`AgentStatusEvent`](../interfaces/AgentStatusEvent.md)

#### Parameters

##### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

#### Returns

[`AgentStatusEvent`](../interfaces/AgentStatusEvent.md)

### getAllAgents

> **getAllAgents**: () => `AgentStateMap`

#### Returns

`AgentStateMap`

### isConnected

> **isConnected**: `boolean`
