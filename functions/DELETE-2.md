[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `message`: `string`; `success`: `boolean`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:83](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/app/api/agent/execution/[executionId]/route.ts#L83)

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
