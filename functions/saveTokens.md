[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / saveTokens

# Function: saveTokens()

> **saveTokens**(`candidateId`, `tokens`): `Promise`\<`void`\>

Defined in: [src/lib/calendar/googleCalendar.ts:103](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/calendar/googleCalendar.ts#L103)

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
