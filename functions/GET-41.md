[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `executions`: `object`[]; `fitAnalysis`: `object` & `object` \| `null`; `intelligence`: `object` & `object` \| `null`; `patterns`: `object`[]; \}\>\>

Defined in: [src/app/api/jobs/\[id\]/role-intelligence/route.ts:9](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/jobs/[id]/role-intelligence/route.ts#L9)

## Parameters

### \_request

`NextRequest`

### context

#### params

`Promise`\<\{ `id`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `executions`: `object`[]; `fitAnalysis`: `object` & `object` \| `null`; `intelligence`: `object` & `object` \| `null`; `patterns`: `object`[]; \}\>\>
