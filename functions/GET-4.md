[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: `object` & `object`; `logs`: `object`[]; `toolCalls`: `object`[]; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/app/api/agent/execution/[executionId]/route.ts#L11)

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
