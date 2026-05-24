[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / verifyOAuthState

# Function: verifyOAuthState()

> **verifyOAuthState**(`state`): `string` \| `null`

Defined in: [src/lib/calendar/oauthState.ts:38](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/calendar/oauthState.ts#L38)

Verifies the HMAC signature and TTL of an OAuth state parameter.
Returns the user email if valid, or null if forged / expired.

## Parameters

### state

`string`

## Returns

`string` \| `null`
