[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / cleanupStaleConnections

# Function: cleanupStaleConnections()

> **cleanupStaleConnections**(`maxAgeMinutes?`): `Promise`\<`void`\>

Defined in: [src/lib/realtime/wsServer.ts:234](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/realtime/wsServer.ts#L234)

Clean up stale connections (no heartbeat response in X minutes).

## Parameters

### maxAgeMinutes?

`number` = `15`

## Returns

`Promise`\<`void`\>
