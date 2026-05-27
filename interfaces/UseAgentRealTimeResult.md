[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseAgentRealTimeResult

# Interface: UseAgentRealTimeResult

Defined in: [src/hooks/useAgentRealTime.ts:5](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L5)

## Properties

### activeCount

> **activeCount**: `number`

Defined in: [src/hooks/useAgentRealTime.ts:8](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L8)

***

### agents

> **agents**: `Record`\<`string`, [`Agent`](Agent.md)\>

Defined in: [src/hooks/useAgentRealTime.ts:6](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L6)

***

### allExecutions

> **allExecutions**: `any`[]

Defined in: [src/hooks/useAgentRealTime.ts:7](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L7)

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useAgentRealTime.ts:13](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L13)

***

### failedCount

> **failedCount**: `number`

Defined in: [src/hooks/useAgentRealTime.ts:10](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L10)

***

### isConnected

> **isConnected**: `boolean`

Defined in: [src/hooks/useAgentRealTime.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L11)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/useAgentRealTime.ts:12](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L12)

***

### refresh

> **refresh**: () => `Promise`\<`void`\>

Defined in: [src/hooks/useAgentRealTime.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L17)

#### Returns

`Promise`\<`void`\>

***

### runningCount

> **runningCount**: `number`

Defined in: [src/hooks/useAgentRealTime.ts:9](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L9)

***

### subscribe

> **subscribe**: (`channel`, `callback`) => () => `void`

Defined in: [src/hooks/useAgentRealTime.ts:15](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L15)

#### Parameters

##### channel

`string`

##### callback

(`data`) => `void`

#### Returns

() => `void`

***

### unsubscribe

> **unsubscribe**: (`channel`) => `void`

Defined in: [src/hooks/useAgentRealTime.ts:16](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useAgentRealTime.ts#L16)

#### Parameters

##### channel

`string`

#### Returns

`void`
