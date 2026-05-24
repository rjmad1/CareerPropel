[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / WebSocketMessage

# Interface: WebSocketMessage\<T\>

Defined in: [src/lib/websocket/types.ts:65](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L65)

## Extended by

- [`AgentStatusMessage`](AgentStatusMessage.md)
- [`AgentLogMessage`](AgentLogMessage.md)
- [`JobUpdateMessage`](JobUpdateMessage.md)
- [`JobCreatedMessage`](JobCreatedMessage.md)
- [`JobDeletedMessage`](JobDeletedMessage.md)
- [`NotificationMessage`](NotificationMessage.md)
- [`ConnectionMessage`](ConnectionMessage.md)
- [`BatchUpdateMessage`](BatchUpdateMessage.md)
- [`AckMessage`](AckMessage.md)
- [`ErrorMessage`](ErrorMessage.md)
- [`HeartbeatMessage`](HeartbeatMessage.md)

## Type Parameters

### T

`T` = `any`

## Properties

### data

> **data**: `T`

Defined in: [src/lib/websocket/types.ts:67](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L67)

***

### messageId

> **messageId**: `string`

Defined in: [src/lib/websocket/types.ts:69](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L69)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/websocket/types.ts:68](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L68)

***

### type

> **type**: `string`

Defined in: [src/lib/websocket/types.ts:66](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/websocket/types.ts#L66)
