[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentLogMessage

# Interface: AgentLogMessage

Defined in: [src/lib/websocket/types.ts:77](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L77)

## Extends

- [`WebSocketMessage`](WebSocketMessage.md)\<[`AgentLog`](AgentLog.md)\>

## Properties

### data

> **data**: [`AgentLog`](AgentLog.md)

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

> **type**: `"agent:log"`

Defined in: [src/lib/websocket/types.ts:78](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L78)

#### Overrides

[`WebSocketMessage`](WebSocketMessage.md).[`type`](WebSocketMessage.md#type)
