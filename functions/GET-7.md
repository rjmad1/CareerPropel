[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `id`: `string`; `output`: `any`; `progress`: `number`; `recentLogs`: `object`[]; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `userId`: `string`; \}\>\>

Defined in: [src/app/api/agents/execute/route.ts:212](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/agents/execute/route.ts#L212)

GET /api/agents/execute/:executionId
Fetch execution status and results

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `id`: `string`; `output`: `any`; `progress`: `number`; `recentLogs`: `object`[]; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `userId`: `string`; \}\>\>
