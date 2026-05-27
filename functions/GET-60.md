[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>

Defined in: [src/app/api/profile/completeness/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/profile/completeness/route.ts#L11)

GET /api/profile/completeness?candidateId={id}
Compute profile completeness score from actual schema data.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `breakdown`: \{ `achievements`: `number`; `profileData`: `number`; `skills`: `number`; \}; `candidateId`: `string`; `score`: `number`; \}\>\>
