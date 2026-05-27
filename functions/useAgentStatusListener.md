[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentStatusListener

# Function: useAgentStatusListener()

> **useAgentStatusListener**(`agentType`): `object`

Defined in: [src/hooks/useAgentStatus.ts:53](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useAgentStatus.ts#L53)

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType-1.md)

## Returns

`object`

### confidence

> **confidence**: `number`

### isCompleted

> **isCompleted**: `boolean`

### isConnected

> **isConnected**: `boolean`

### isError

> **isError**: `boolean`

### isRunning

> **isRunning**: `boolean`

### lastActivity

> **lastActivity**: `Date` \| `null`

### queueDepth

> **queueDepth**: `number`

### status

> **status**: [`AgentStatusEvent`](../interfaces/AgentStatusEvent.md)
