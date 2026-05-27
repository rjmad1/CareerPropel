[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PATCH

# Function: PATCH()

> **PATCH**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/\[id\]/route.ts:81](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/app/api/jobs/[id]/route.ts#L81)

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
