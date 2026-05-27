[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `hasMore`: `boolean`; `logs`: `object`[]; `offset`: `number`; `page`: `number`; `pageSize`: `number`; `total`: `number`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/logs/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/agent/execution/[executionId]/logs/route.ts#L11)

GET /api/agent/execution/[executionId]/logs
Fetch execution logs

## Parameters

### request

`NextRequest`

### \_\_namedParameters

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `hasMore`: `boolean`; `logs`: `object`[]; `offset`: `number`; `page`: `number`; `pageSize`: `number`; `total`: `number`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
