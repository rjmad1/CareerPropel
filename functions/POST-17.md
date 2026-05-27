[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<[`GeneratedDocument`](../interfaces/GeneratedDocument.md)\>\>\>

Defined in: [src/app/api/documents/generate/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/app/api/documents/generate/route.ts#L23)

POST /api/documents/generate
Generate a tailored resume or cover letter using AI.
Fetches job context and candidate profile automatically.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<[`GeneratedDocument`](../interfaces/GeneratedDocument.md)\>\>\>
