[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `message`: `string`; `success`: `boolean`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:83](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/agent/execution/[executionId]/route.ts#L83)

DELETE /api/agent/execution/[executionId]
Delete execution and all related data

## Parameters

### \_request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `message`: `string`; `success`: `boolean`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
