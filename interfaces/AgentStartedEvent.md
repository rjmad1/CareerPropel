[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStartedEvent

# Interface: AgentStartedEvent

Defined in: [src/lib/realtime/events.ts:52](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L52)

Agent execution started event
Published when agent begins work

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:55](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L55)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/realtime/events.ts:56](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L56)

***

### input

> **input**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/realtime/events.ts:58](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L58)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/lib/realtime/events.ts:57](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L57)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:59](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L59)

***

### type

> **type**: `"agent:started"`

Defined in: [src/lib/realtime/events.ts:53](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L53)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:54](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L54)
