[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/route.ts:24](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/jobs/route.ts#L24)

GET /api/jobs
Retrieve all jobs with optional filtering
Protected: Requires authentication
Rate Limited: 100 requests per minute per IP
Returns only jobs belonging to the authenticated user

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
