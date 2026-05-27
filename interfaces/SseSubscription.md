[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / SseSubscription

# Interface: SseSubscription

Defined in: [src/lib/realtime/sse-manager.ts:107](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/sse-manager.ts#L107)

## Properties

### connected

> **connected**: `boolean`

Defined in: [src/lib/realtime/sse-manager.ts:109](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/sse-manager.ts#L109)

Current connection state

***

### onConnectionChange

> **onConnectionChange**: (`listener`) => () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:113](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/sse-manager.ts#L113)

Subscribe to connection state changes. Returns unsubscribe fn.

#### Parameters

##### listener

(`connected`) => `void`

#### Returns

() => `void`

***

### release

> **release**: () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:115](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/sse-manager.ts#L115)

Release this subscription's hold on the connection.

#### Returns

`void`

***

### subscribe

> **subscribe**: (`type`, `handler`) => () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:111](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/realtime/sse-manager.ts#L111)

Subscribe to a specific event type. Returns unsubscribe fn.

#### Parameters

##### type

`string`

##### handler

`MessageHandler`

#### Returns

() => `void`
