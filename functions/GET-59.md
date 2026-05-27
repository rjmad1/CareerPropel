[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>

Defined in: [src/app/api/profile/appraisal-compile/route.ts:12](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/profile/appraisal-compile/route.ts#L12)

GET /api/profile/appraisal-compile
Returns all past AppraisalSession records for the logged-in candidate.

## Parameters

### \_request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `sessions`: `object`[]; \}\>\>
