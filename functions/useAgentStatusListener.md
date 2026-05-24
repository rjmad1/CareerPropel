[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentStatusListener

# Function: useAgentStatusListener()

> **useAgentStatusListener**(`agentType`): `object`

Defined in: [src/hooks/useAgentStatus.ts:219](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/hooks/useAgentStatus.ts#L219)

Hook for listening to a specific agent's status

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

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
