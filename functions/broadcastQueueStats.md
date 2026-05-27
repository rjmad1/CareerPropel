[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastQueueStats

# Function: broadcastQueueStats()

> **broadcastQueueStats**(`userId`, `pending`, `running`, `completed`, `failed`, `avgProcessingTime`, `throughputPerMin`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:196](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/realtime/agentStatusBroadcaster.ts#L196)

Broadcast queue statistics

## Parameters

### userId

`string`

### pending

`number`

### running

`number`

### completed

`number`

### failed

`number`

### avgProcessingTime

`number`

### throughputPerMin

`number`

## Returns

`Promise`\<`void`\>
