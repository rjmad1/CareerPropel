[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishEvent

# Function: publishEvent()

> **publishEvent**(`redis`, `channel`, `event`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/events.ts:143](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/realtime/events.ts#L143)

Publish event to Redis pub/sub

## Parameters

### redis

`any`

### channel

`string`

### event

[`RealtimeEvent`](../type-aliases/RealtimeEvent.md)

## Returns

`Promise`\<`void`\>
