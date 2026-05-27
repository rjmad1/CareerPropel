[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentCompletedEvent

# Interface: AgentCompletedEvent

Defined in: [src/lib/realtime/events.ts:66](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L66)

Agent execution completed event
Published when agent finishes (success or failure)

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:69](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L69)

***

### duration

> **duration**: `number`

Defined in: [src/lib/realtime/events.ts:76](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L76)

***

### error?

> `optional` **error?**: `string`

Defined in: [src/lib/realtime/events.ts:74](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L74)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/realtime/events.ts:70](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L70)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/lib/realtime/events.ts:71](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L71)

***

### output?

> `optional` **output?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/realtime/events.ts:73](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L73)

***

### status

> **status**: `"success"` \| `"failed"`

Defined in: [src/lib/realtime/events.ts:72](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L72)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:77](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L77)

***

### tokensUsed

> **tokensUsed**: `number`

Defined in: [src/lib/realtime/events.ts:75](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L75)

***

### type

> **type**: `"agent:completed"`

Defined in: [src/lib/realtime/events.ts:67](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L67)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:68](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L68)
