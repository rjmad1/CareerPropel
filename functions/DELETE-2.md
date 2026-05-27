[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `message`: `string`; `success`: `boolean`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:78](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/app/api/agent/execution/[executionId]/route.ts#L78)

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
