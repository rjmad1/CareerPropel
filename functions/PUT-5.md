[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PUT

# Function: PUT()

> **PUT**(`request`): `Promise`\<`NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:47](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/profile/completeness/route.ts#L47)

PUT /api/profile/completeness?candidateId={id}
Update profile completeness score

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `calculatedAt`: `Date`; `candidateId`: `string`; `id`: `string`; `overall`: `number`; `recommendations`: `JsonValue`; `sections`: `JsonValue`; `updatedAt`: `Date`; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
