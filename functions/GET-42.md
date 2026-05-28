[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`, `__namedParameters`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/\[id\]/route.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/jobs/[id]/route.ts#L26)

GET /api/jobs/[id]
Retrieve a specific job by ID
Protected: Requires authentication
Authorization: User must own the job
Rate Limited: 100 requests per minute

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
