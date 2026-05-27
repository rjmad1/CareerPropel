[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useAgentQueue

# Function: useAgentQueue()

> **useAgentQueue**(): `object`

Defined in: [src/hooks/useAgents.ts:110](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useAgents.ts#L110)

## Returns

`object`

### enqueue

> **enqueue**: (`agentType`, `context?`) => `Promise`\<[`ExecuteAgentResult`](../interfaces/ExecuteAgentResult.md)\>

#### Parameters

##### agentType

[`AgentType`](../type-aliases/AgentType-2.md)

##### context?

`Record`\<`string`, `string` \| `undefined`\>

#### Returns

`Promise`\<[`ExecuteAgentResult`](../interfaces/ExecuteAgentResult.md)\>

### error

> **error**: `Error` \| `null` = `execute.error`

### invalidate

> **invalidate**: () => `void`

#### Returns

`void`

### isError

> **isError**: `boolean` = `execute.isError`

### isPending

> **isPending**: `boolean` = `execute.isPending`

### isSuccess

> **isSuccess**: `boolean` = `execute.isSuccess`

### lastResult

> **lastResult**: [`ExecuteAgentResult`](../interfaces/ExecuteAgentResult.md) \| `undefined` = `execute.data`

### reset

> **reset**: () => `void` = `execute.reset`

#### Returns

`void`
