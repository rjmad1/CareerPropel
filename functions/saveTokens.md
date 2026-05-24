[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / saveTokens

# Function: saveTokens()

> **saveTokens**(`candidateId`, `tokens`): `Promise`\<`void`\>

Defined in: [src/lib/calendar/googleCalendar.ts:103](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/calendar/googleCalendar.ts#L103)

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
