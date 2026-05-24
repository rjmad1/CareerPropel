[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / subscribeToAgentUpdates

# Function: subscribeToAgentUpdates()

> **subscribeToAgentUpdates**(`clientId`, `userId`, `socket`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:46](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/realtime/wsServer.ts#L46)

Subscribe a client to agent updates for a specific user.

RASUI-004 fix: creates a dedicated per-connection Redis subscriber that is
stored on the ClientConnection object. This ensures cleanup() can call
subscriber.quit() rather than incorrectly operating on the shared redis client.

## Parameters

### clientId

`string`

### userId

`string`

### socket

`any`

## Returns

`Promise`\<`void`\>
