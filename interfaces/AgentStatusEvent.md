[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStatusEvent

# Interface: AgentStatusEvent

Defined in: [src/lib/realtime/events.ts:21](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L21)

Agent status update event
Published when agent state changes

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:24](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L24)

***

### confidence?

> `optional` **confidence?**: `number`

Defined in: [src/lib/realtime/events.ts:30](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L30)

***

### currentTask?

> `optional` **currentTask?**: `string`

Defined in: [src/lib/realtime/events.ts:27](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L27)

***

### lastActivity

> **lastActivity**: `Date`

Defined in: [src/lib/realtime/events.ts:28](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L28)

***

### queueDepth

> **queueDepth**: `number`

Defined in: [src/lib/realtime/events.ts:26](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L26)

***

### status

> **status**: [`AgentStatus`](../type-aliases/AgentStatus.md)

Defined in: [src/lib/realtime/events.ts:25](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L25)

***

### tokensUsed?

> `optional` **tokensUsed?**: `number`

Defined in: [src/lib/realtime/events.ts:29](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L29)

***

### type

> **type**: `"agent:status_update"`

Defined in: [src/lib/realtime/events.ts:22](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L22)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:23](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L23)
