[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / unsubscribeClient

# Function: unsubscribeClient()

> **unsubscribeClient**(`clientId`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:103](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/realtime/wsServer.ts#L103)

Unsubscribe a client and clean up its connection.

RASUI-004 fix: calls subscriber.quit() on the per-connection subscriber
rather than redis.unsubscribe() on the shared singleton client.

## Parameters

### clientId

`string`

## Returns

`Promise`\<`void`\>
