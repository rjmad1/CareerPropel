[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/profile/completeness/route.ts#L11)

GET /api/profile/completeness?candidateId={id}
Fetch profile completeness score and breakdown

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\>\>
