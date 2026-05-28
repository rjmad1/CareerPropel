[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / verifyOAuthState

# Function: verifyOAuthState()

> **verifyOAuthState**(`state`): `string` \| `null`

Defined in: [src/lib/calendar/oauthState.ts:38](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/calendar/oauthState.ts#L38)

Verifies the HMAC signature and TTL of an OAuth state parameter.
Returns the user email if valid, or null if forged / expired.

## Parameters

### state

`string`

## Returns

`string` \| `null`
