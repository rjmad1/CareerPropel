[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/appraisal-compile/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/profile/appraisal-compile/route.ts#L12)

GET /api/profile/appraisal-compile
Returns all past AppraisalSession records for the logged-in candidate.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>
