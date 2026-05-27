[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / acquireSseSubscription

# Function: acquireSseSubscription()

> **acquireSseSubscription**(`endpoint`): [`SseSubscription`](../interfaces/SseSubscription.md)

Defined in: [src/lib/realtime/sse-manager.ts:123](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/realtime/sse-manager.ts#L123)

Acquire a subscription to the SSE endpoint.
Multiple calls with the same endpoint share one EventSource.
Call release() when no longer needed (component unmount).

## Parameters

### endpoint

`string`

## Returns

[`SseSubscription`](../interfaces/SseSubscription.md)
