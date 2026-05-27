[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/profile/completeness/route.ts#L11)

GET /api/profile/completeness?candidateId={id}
Compute profile completeness score from actual schema data.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>
