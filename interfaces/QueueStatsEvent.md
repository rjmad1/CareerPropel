[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / QueueStatsEvent

# Interface: QueueStatsEvent

Defined in: [src/lib/realtime/events.ts:90](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L90)

Queue stats event
Published periodically with queue depth and throughput

## Properties

### avgProcessingTime

> **avgProcessingTime**: `number`

Defined in: [src/lib/realtime/events.ts:97](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L97)

***

### completed

> **completed**: `number`

Defined in: [src/lib/realtime/events.ts:95](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L95)

***

### failed

> **failed**: `number`

Defined in: [src/lib/realtime/events.ts:96](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L96)

***

### pending

> **pending**: `number`

Defined in: [src/lib/realtime/events.ts:93](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L93)

***

### running

> **running**: `number`

Defined in: [src/lib/realtime/events.ts:94](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L94)

***

### throughputPerMin

> **throughputPerMin**: `number`

Defined in: [src/lib/realtime/events.ts:98](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L98)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:99](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L99)

***

### type

> **type**: `"queue:stats"`

Defined in: [src/lib/realtime/events.ts:91](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L91)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:92](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/events.ts#L92)
