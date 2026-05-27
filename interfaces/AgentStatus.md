[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentStatus

# Interface: AgentStatus

Defined in: [src/types/agent.ts:98](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L98)

Real-time agent status (WebSocket update)

## Properties

### confidence

> **confidence**: `number`

Defined in: [src/types/agent.ts:108](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L108)

***

### currentTask?

> `optional` **currentTask?**: `string`

Defined in: [src/types/agent.ts:103](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L103)

***

### eta?

> `optional` **eta?**: `number`

Defined in: [src/types/agent.ts:104](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L104)

***

### id

> **id**: [`AgentType`](../type-aliases/AgentType-2.md)

Defined in: [src/types/agent.ts:99](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L99)

***

### lastActivity

> **lastActivity**: `Date`

Defined in: [src/types/agent.ts:106](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L106)

***

### lastError?

> `optional` **lastError?**: `string`

Defined in: [src/types/agent.ts:109](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L109)

***

### name

> **name**: `string`

Defined in: [src/types/agent.ts:100](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L100)

***

### progress

> **progress**: `number`

Defined in: [src/types/agent.ts:102](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L102)

***

### queueDepth

> **queueDepth**: `number`

Defined in: [src/types/agent.ts:105](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L105)

***

### status

> **status**: `"error"` \| `"waiting"` \| `"running"` \| `"idle"`

Defined in: [src/types/agent.ts:101](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L101)

***

### tokensUsed

> **tokensUsed**: `number`

Defined in: [src/types/agent.ts:107](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L107)

***

### uptime?

> `optional` **uptime?**: `number`

Defined in: [src/types/agent.ts:110](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/agent.ts#L110)
