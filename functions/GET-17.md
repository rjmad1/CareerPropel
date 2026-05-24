[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(): `Promise`\<`NextResponse`\<`unknown`\>\>

Defined in: [src/app/api/calendar/authorize/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/calendar/authorize/route.ts#L14)

GET /api/calendar/authorize
Redirects the authenticated user to Google's OAuth2 consent screen.
The `state` param is HMAC-signed to prevent CSRF / account-linking attacks.

## Returns

`Promise`\<`NextResponse`\<`unknown`\>\>
