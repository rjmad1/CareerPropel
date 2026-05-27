[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string`[]; \}\>\>

Defined in: [src/app/api/profile/recommendations/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/profile/recommendations/route.ts#L11)

GET /api/profile/recommendations?candidateId={id}
Return profile improvement recommendations based on completeness gaps.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string`[]; \}\>\>
