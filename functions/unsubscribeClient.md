[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / unsubscribeClient

# Function: unsubscribeClient()

> **unsubscribeClient**(`clientId`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:103](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/realtime/wsServer.ts#L103)

Unsubscribe a client and clean up its connection.

RASUI-004 fix: calls subscriber.quit() on the per-connection subscriber
rather than redis.unsubscribe() on the shared singleton client.

## Parameters

### clientId

`string`

## Returns

`Promise`\<`void`\>
