[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastQueueStats

# Function: broadcastQueueStats()

> **broadcastQueueStats**(`userId`, `pending`, `running`, `completed`, `failed`, `avgProcessingTime`, `throughputPerMin`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:196](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/realtime/agentStatusBroadcaster.ts#L196)

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
