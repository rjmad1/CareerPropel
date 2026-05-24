[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/appraisal-compile/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/profile/appraisal-compile/route.ts#L12)

GET /api/profile/appraisal-compile
Returns all past AppraisalSession records for the logged-in candidate.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>
