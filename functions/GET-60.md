[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/profile/completeness/route.ts#L11)

GET /api/profile/completeness?candidateId={id}
Compute profile completeness score from actual schema data.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>
