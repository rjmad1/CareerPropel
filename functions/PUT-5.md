[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PUT

# Function: PUT()

> **PUT**(`request`): `Promise`\<`NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:47](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/profile/completeness/route.ts#L47)

PUT /api/profile/completeness?candidateId={id}
Update profile completeness score

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
