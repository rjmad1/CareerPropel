[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / verifyOAuthState

# Function: verifyOAuthState()

> **verifyOAuthState**(`state`): `string` \| `null`

Defined in: [src/lib/calendar/oauthState.ts:38](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/calendar/oauthState.ts#L38)

Verifies the HMAC signature and TTL of an OAuth state parameter.
Returns the user email if valid, or null if forged / expired.

## Parameters

### state

`string`

## Returns

`string` \| `null`
