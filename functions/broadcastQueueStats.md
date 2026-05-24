[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / broadcastQueueStats

# Function: broadcastQueueStats()

> **broadcastQueueStats**(`userId`, `pending`, `running`, `completed`, `failed`, `avgProcessingTime`, `throughputPerMin`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/agentStatusBroadcaster.ts:197](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/realtime/agentStatusBroadcaster.ts#L197)

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
