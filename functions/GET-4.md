[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: `object` & `object`; `logs`: `object`[]; `toolCalls`: `object`[]; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/agent/execution/[executionId]/route.ts#L12)

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
