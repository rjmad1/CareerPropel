[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / unsubscribeClient

# Function: unsubscribeClient()

> **unsubscribeClient**(`clientId`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:103](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/realtime/wsServer.ts#L103)

Unsubscribe a client and clean up its connection.

RASUI-004 fix: calls subscriber.quit() on the per-connection subscriber
rather than redis.unsubscribe() on the shared singleton client.

## Parameters

### clientId

`string`

## Returns

`Promise`\<`void`\>
