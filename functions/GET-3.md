[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `limit`: `number`; `logs`: `object`[]; `offset`: `number`; `total`: `number`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/logs/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/agent/execution/[executionId]/logs/route.ts#L11)

GET /api/agent/execution/[executionId]/logs
Fetch execution logs

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `limit`: `number`; `logs`: `object`[]; `offset`: `number`; `total`: `number`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
