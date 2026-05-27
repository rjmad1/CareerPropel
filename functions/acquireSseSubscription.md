[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / acquireSseSubscription

# Function: acquireSseSubscription()

> **acquireSseSubscription**(`endpoint`): [`SseSubscription`](../interfaces/SseSubscription.md)

Defined in: [src/lib/realtime/sse-manager.ts:123](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/sse-manager.ts#L123)

Acquire a subscription to the SSE endpoint.
Multiple calls with the same endpoint share one EventSource.
Call release() when no longer needed (component unmount).

## Parameters

### endpoint

`string`

## Returns

[`SseSubscription`](../interfaces/SseSubscription.md)
