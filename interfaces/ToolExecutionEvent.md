[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ToolExecutionEvent

# Interface: ToolExecutionEvent

Defined in: [src/lib/realtime/events.ts:37](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L37)

Tool execution event
Published when an agent tool executes

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType-1.md)

Defined in: [src/lib/realtime/events.ts:40](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L40)

***

### duration

> **duration**: `number`

Defined in: [src/lib/realtime/events.ts:44](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L44)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/realtime/events.ts:41](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L41)

***

### status

> **status**: `"success"` \| `"failed"` \| `"pending"`

Defined in: [src/lib/realtime/events.ts:43](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L43)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:45](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L45)

***

### toolName

> **toolName**: `string`

Defined in: [src/lib/realtime/events.ts:42](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L42)

***

### type

> **type**: `"tool:execution"`

Defined in: [src/lib/realtime/events.ts:38](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L38)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:39](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/realtime/events.ts#L39)
