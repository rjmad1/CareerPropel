[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / DELETE

# Function: DELETE()

> **DELETE**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/\[id\]/route.ts:164](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/jobs/[id]/route.ts#L164)

DELETE /api/jobs/[id]
Delete a specific job
Protected: Requires authentication
Authorization: User must own the job
Rate Limited: 30 requests per minute

## Parameters

### request

`NextRequest`

### \_\_namedParameters

#### params

\{ `id`: `string`; \}

#### params.id

`string`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
