[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / QueueStatsEvent

# Interface: QueueStatsEvent

Defined in: [src/lib/realtime/events.ts:84](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L84)

Queue stats event
Published periodically with queue depth and throughput

## Properties

### avgProcessingTime

> **avgProcessingTime**: `number`

Defined in: [src/lib/realtime/events.ts:91](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L91)

***

### completed

> **completed**: `number`

Defined in: [src/lib/realtime/events.ts:89](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L89)

***

### failed

> **failed**: `number`

Defined in: [src/lib/realtime/events.ts:90](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L90)

***

### pending

> **pending**: `number`

Defined in: [src/lib/realtime/events.ts:87](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L87)

***

### running

> **running**: `number`

Defined in: [src/lib/realtime/events.ts:88](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L88)

***

### throughputPerMin

> **throughputPerMin**: `number`

Defined in: [src/lib/realtime/events.ts:92](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L92)

***

### timestamp

> **timestamp**: `Date`

Defined in: [src/lib/realtime/events.ts:93](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L93)

***

### type

> **type**: `"queue:stats"`

Defined in: [src/lib/realtime/events.ts:85](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L85)

***

### userId

> **userId**: `string`

Defined in: [src/lib/realtime/events.ts:86](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/events.ts#L86)
