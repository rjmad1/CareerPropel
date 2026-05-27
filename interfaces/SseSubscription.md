[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / SseSubscription

# Interface: SseSubscription

Defined in: [src/lib/realtime/sse-manager.ts:107](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/sse-manager.ts#L107)

## Properties

### connected

> **connected**: `boolean`

Defined in: [src/lib/realtime/sse-manager.ts:109](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/sse-manager.ts#L109)

Current connection state

***

### onConnectionChange

> **onConnectionChange**: (`listener`) => () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:113](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/sse-manager.ts#L113)

Subscribe to connection state changes. Returns unsubscribe fn.

#### Parameters

##### listener

(`connected`) => `void`

#### Returns

() => `void`

***

### release

> **release**: () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:115](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/sse-manager.ts#L115)

Release this subscription's hold on the connection.

#### Returns

`void`

***

### subscribe

> **subscribe**: (`type`, `handler`) => () => `void`

Defined in: [src/lib/realtime/sse-manager.ts:111](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/sse-manager.ts#L111)

Subscribe to a specific event type. Returns unsubscribe fn.

#### Parameters

##### type

`string`

##### handler

`MessageHandler`

#### Returns

() => `void`
