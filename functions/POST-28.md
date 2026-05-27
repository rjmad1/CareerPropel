[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`request`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/jobs/route.ts:104](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/jobs/route.ts#L104)

POST /api/jobs
Create a new job
Protected: Requires authentication
Rate Limited: 20 requests per minute per IP
CSRF Protected: Requires valid CSRF token (optional in dev)
Job will be created for the authenticated user

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
