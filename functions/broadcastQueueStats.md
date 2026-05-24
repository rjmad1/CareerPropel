[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastQueueStats

# Function: broadcastQueueStats()

> **broadcastQueueStats**(`userId`, `pending`, `running`, `completed`, `failed`, `avgProcessingTime`, `throughputPerMin`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:197](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/realtime/agentStatusBroadcaster.ts#L197)

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
