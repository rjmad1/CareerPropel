[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getAgentLogs

# Function: getAgentLogs()

> **getAgentLogs**(`executionId`, `options?`): `Promise`\<[`LogsResponse`](../interfaces/LogsResponse.md)\>

Defined in: [src/lib/agent/agentService.ts:54](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/agent/agentService.ts#L54)

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
