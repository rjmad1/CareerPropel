[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidate

# Function: getCandidate()

> **getCandidate**(`email`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [src/lib/route-helpers/candidate.ts:8](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/route-helpers/candidate.ts#L8)

Shared helper: look up the Candidate row for an authenticated user email.
Throws a NotFoundError (status 404) when the profile does not exist.

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `id`: `string`; \}\>
