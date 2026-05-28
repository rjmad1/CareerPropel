[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: `object` & `object`; `logs`: `object`[]; `toolCalls`: `object`[]; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/agent/execution/[executionId]/route.ts#L12)

GET /api/agent/execution/[executionId]
Fetch execution details with tool calls and logs

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: `object` & `object`; `logs`: `object`[]; `toolCalls`: `object`[]; \}\>\>
