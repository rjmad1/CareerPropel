[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / BatchUpdateMessage

# Interface: BatchUpdateMessage

Defined in: [src/lib/websocket/types.ts:101](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L101)

## Extends

- [`WebSocketMessage`](WebSocketMessage.md)\<\{ `batchId`: `string`; `updates`: ([`RealtimeJobUpdate`](RealtimeJobUpdate.md) \| [`AgentStatusMessage`](AgentStatusMessage.md) \| [`AgentLogMessage`](AgentLogMessage.md))[]; \}\>

## Properties

### data

> **data**: `object`

Defined in: [src/lib/websocket/types.ts:67](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L67)

#### batchId

> **batchId**: `string`

#### updates

> **updates**: ([`RealtimeJobUpdate`](RealtimeJobUpdate.md) \| [`AgentStatusMessage`](AgentStatusMessage.md) \| [`AgentLogMessage`](AgentLogMessage.md))[]

#### Inherited from

[`WebSocketMessage`](WebSocketMessage.md).[`data`](WebSocketMessage.md#data)

***

### messageId

> **messageId**: `string`

Defined in: [src/lib/websocket/types.ts:69](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L69)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage.md).[`messageId`](WebSocketMessage.md#messageid)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/websocket/types.ts:68](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L68)

#### Inherited from

[`WebSocketMessage`](WebSocketMessage.md).[`timestamp`](WebSocketMessage.md#timestamp)

***

### type

> **type**: `"batch:update"`

Defined in: [src/lib/websocket/types.ts:105](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L105)

#### Overrides

[`WebSocketMessage`](WebSocketMessage.md).[`type`](WebSocketMessage.md#type)
