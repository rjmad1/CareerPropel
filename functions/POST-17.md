[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<[`GeneratedDocument`](../interfaces/GeneratedDocument.md)\>\>\>

Defined in: [src/app/api/documents/generate/route.ts:23](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/documents/generate/route.ts#L23)

POST /api/documents/generate
Generate a tailored resume or cover letter using AI.
Fetches job context and candidate profile automatically.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<[`ApiErrorResponse`](../interfaces/ApiErrorResponse.md)\> \| `NextResponse`\<[`SuccessResponse`](../interfaces/SuccessResponse.md)\<[`GeneratedDocument`](../interfaces/GeneratedDocument.md)\>\>\>
