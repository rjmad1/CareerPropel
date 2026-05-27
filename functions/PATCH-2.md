[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PATCH

# Function: PATCH()

> **PATCH**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/\[id\]/route.ts:81](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/jobs/[id]/route.ts#L81)

PATCH /api/jobs/[id]
Update a specific job
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
