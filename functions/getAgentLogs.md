[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentLogs

# Function: getAgentLogs()

> **getAgentLogs**(`executionId`, `options?`): `Promise`\<[`LogsResponse`](../interfaces/LogsResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:54](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/agent/agentService.ts#L54)

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
