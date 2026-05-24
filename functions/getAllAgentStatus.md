[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAllAgentStatus

# Function: getAllAgentStatus()

> **getAllAgentStatus**(`userId`): `Promise`\<`Record`\<`string`, `any`\>\>

Defined in: [src/lib/realtime/wsServer.ts:162](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/realtime/wsServer.ts#L162)

Get all agents' current status for a user.

RASUI-004 fix: replaces redis.keys(pattern) [O(N) blocking] with cursor-based
SCAN iteration [O(1) per call, non-blocking, safe under large keyspaces].

## Parameters

### userId

`string`

## Returns

`Promise`\<`Record`\<`string`, `any`\>\>
