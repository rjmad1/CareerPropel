[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobUpdateMessage

# Interface: JobUpdateMessage

Defined in: [src/lib/websocket/types.ts:81](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L81)

## Extends

- [`WebSocketMessage`](WebSocketMessage.md)\<[`RealtimeJobUpdate`](RealtimeJobUpdate.md)\>

## Properties

### data

> **data**: [`RealtimeJobUpdate`](RealtimeJobUpdate.md)

Defined in: [src/lib/websocket/types.ts:67](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L67)

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

> **type**: `"job:update"`

Defined in: [src/lib/websocket/types.ts:82](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L82)

#### Overrides

[`WebSocketMessage`](WebSocketMessage.md).[`type`](WebSocketMessage.md#type)
