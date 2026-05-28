[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStartedEvent

# Interface: AgentStartedEvent

Defined in: [src/lib/realtime/events.ts:58](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L58)

Agent execution started event
Published when agent begins work

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:61](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L61)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/realtime/events.ts:62](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L62)

***

### input

> **input**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/realtime/events.ts:64](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L64)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/lib/realtime/events.ts:63](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L63)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:65](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L65)

***

### type

> **type**: `"agent:started"`

Defined in: [src/lib/realtime/events.ts:59](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L59)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:60](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L60)
