[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/calendar/callback/route.ts:13](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/calendar/callback/route.ts#L13)

GET /api/calendar/callback?code=...&state=...
Google redirects here after the user grants consent.
Verifies the HMAC-signed state before exchanging the auth code.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
