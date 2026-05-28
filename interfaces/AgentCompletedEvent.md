[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentCompletedEvent

# Interface: AgentCompletedEvent

Defined in: [src/lib/realtime/events.ts:72](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L72)

Agent execution completed event
Published when agent finishes (success or failure)

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:75](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L75)

***

### duration

> **duration**: `number`

Defined in: [src/lib/realtime/events.ts:82](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L82)

***

### error?

> `optional` **error?**: `string`

Defined in: [src/lib/realtime/events.ts:80](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L80)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/realtime/events.ts:76](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L76)

***

### jobId?

> `optional` **jobId?**: `string`

Defined in: [src/lib/realtime/events.ts:77](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L77)

***

### output?

> `optional` **output?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/realtime/events.ts:79](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L79)

***

### status

> **status**: `"success"` \| `"failed"`

Defined in: [src/lib/realtime/events.ts:78](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L78)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:83](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L83)

***

### tokensUsed

> **tokensUsed**: `number`

Defined in: [src/lib/realtime/events.ts:81](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L81)

***

### type

> **type**: `"agent:completed"`

Defined in: [src/lib/realtime/events.ts:73](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L73)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:74](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L74)
