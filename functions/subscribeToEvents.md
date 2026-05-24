[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToEvents

# Function: subscribeToEvents()

> **subscribeToEvents**(`callback`): () => `void`

Defined in: [src/lib/realtime/shared-subscriber.ts:63](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/realtime/shared-subscriber.ts#L63)

Subscribe an SSE callback to all Redis events.
Returns an unsubscribe function — call it when the SSE connection closes.

## Parameters

### callback

(`channel`, `event`) => `void`

## Returns

() => `void`
