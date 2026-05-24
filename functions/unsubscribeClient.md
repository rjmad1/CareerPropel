[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / unsubscribeClient

# Function: unsubscribeClient()

> **unsubscribeClient**(`clientId`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:103](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/realtime/wsServer.ts#L103)

Unsubscribe a client and clean up its connection.

RASUI-004 fix: calls subscriber.quit() on the per-connection subscriber
rather than redis.unsubscribe() on the shared singleton client.

## Parameters

### clientId

`string`

## Returns

`Promise`\<`void`\>
