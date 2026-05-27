[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<\{ `hasMore`: `boolean`; `logs`: `object`[]; `offset`: `number`; `page`: `number`; `pageSize`: `number`; `total`: `number`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/logs/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/agent/execution/[executionId]/logs/route.ts#L11)

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
