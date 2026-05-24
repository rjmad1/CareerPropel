[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/calendar/authorize/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/calendar/authorize/route.ts#L14)

GET /api/calendar/authorize
Redirects the authenticated user to Google's OAuth2 consent screen.
The `state` param is HMAC-signed to prevent CSRF / account-linking attacks.

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
