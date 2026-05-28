[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToEvents

# Function: subscribeToEvents()

> **subscribeToEvents**(`callback`): () => `void`

Defined in: [src/lib/realtime/shared-subscriber.ts:63](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/shared-subscriber.ts#L63)

Subscribe an SSE callback to all Redis events.
Returns an unsubscribe function — call it when the SSE connection closes.

## Parameters

### callback

(`channel`, `event`) => `void`

## Returns

() => `void`
