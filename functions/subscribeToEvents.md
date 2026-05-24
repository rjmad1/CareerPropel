[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToEvents

# Function: subscribeToEvents()

> **subscribeToEvents**(`callback`): () => `void`

Defined in: [src/lib/realtime/shared-subscriber.ts:63](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/shared-subscriber.ts#L63)

Subscribe an SSE callback to all Redis events.
Returns an unsubscribe function — call it when the SSE connection closes.

## Parameters

### callback

(`channel`, `event`) => `void`

## Returns

() => `void`
