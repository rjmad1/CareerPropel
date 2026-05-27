[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string`[]; \}\>\>

Defined in: [src/app/api/profile/recommendations/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/profile/recommendations/route.ts#L11)

GET /api/profile/recommendations?candidateId={id}
Return profile improvement recommendations based on completeness gaps.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `recommendations`: `string`[]; \}\>\>
