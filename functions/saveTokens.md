[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / saveTokens

# Function: saveTokens()

> **saveTokens**(`candidateId`, `tokens`): `Promise`\<`void`\>

Defined in: [src/lib/calendar/googleCalendar.ts:103](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/calendar/googleCalendar.ts#L103)

Persist tokens for a candidate. Updates if a record already exists.

RASUI-002 remediation: accessToken and refreshToken are encrypted with
AES-256-GCM before being written to the database. They are decrypted
transparently on read in getValidAccessToken().

## Parameters

### candidateId

`string`

### tokens

`TokenResponse`

## Returns

`Promise`\<`void`\>
