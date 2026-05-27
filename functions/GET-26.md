[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`request`): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/calendar/callback/route.ts:13](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/app/api/calendar/callback/route.ts#L13)

GET /api/calendar/callback?code=...&state=...
Google redirects here after the user grants consent.
Verifies the HMAC-signed state before exchanging the auth code.

## Parameters

### request

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
