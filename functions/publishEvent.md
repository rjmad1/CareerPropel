[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / publishEvent

# Function: publishEvent()

> **publishEvent**(`redis`, `channel`, `event`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/events.ts:149](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L149)

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
