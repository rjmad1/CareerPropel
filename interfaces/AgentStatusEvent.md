[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStatusEvent

# Interface: AgentStatusEvent

Defined in: [src/lib/realtime/events.ts:27](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L27)

Agent status update event
Published when agent state changes

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:30](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L30)

***

### confidence?

> `optional` **confidence?**: `number`

Defined in: [src/lib/realtime/events.ts:36](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L36)

***

### currentTask?

> `optional` **currentTask?**: `string`

Defined in: [src/lib/realtime/events.ts:33](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L33)

***

### lastActivity

> **lastActivity**: `Date`

Defined in: [src/lib/realtime/events.ts:34](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L34)

***

### queueDepth

> **queueDepth**: `number`

Defined in: [src/lib/realtime/events.ts:32](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L32)

***

### status

> **status**: [`AgentStatus`](../type-aliases/AgentStatus.md)

Defined in: [src/lib/realtime/events.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L31)

***

### tokensUsed?

> `optional` **tokensUsed?**: `number`

Defined in: [src/lib/realtime/events.ts:35](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L35)

***

### type

> **type**: `"agent:status_update"`

Defined in: [src/lib/realtime/events.ts:28](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L28)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:29](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L29)
