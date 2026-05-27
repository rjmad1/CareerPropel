[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishEvent

# Function: publishEvent()

> **publishEvent**(`redis`, `channel`, `event`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/events.ts:143](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/events.ts#L143)

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
