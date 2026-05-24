[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentLogs

# Function: getAgentLogs()

> **getAgentLogs**(`executionId`, `options?`): `Promise`\<[`LogsResponse`](../interfaces/LogsResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:54](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/agent/agentService.ts#L54)

Fetch paginated logs for an execution

## Parameters

### executionId

`string`

### options?

#### level?

`"INFO"` \| `"WARN"` \| `"ERROR"` \| `"DEBUG"`

#### page?

`number`

#### pageSize?

`number`

## Returns

`Promise`\<[`LogsResponse`](../interfaces/LogsResponse.md)\>
