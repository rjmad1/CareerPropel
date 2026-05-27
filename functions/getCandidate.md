[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidate

# Function: getCandidate()

> **getCandidate**(`email`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [src/lib/route-helpers/candidate.ts:8](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/route-helpers/candidate.ts#L8)

Shared helper: look up the Candidate row for an authenticated user email.
Throws a NotFoundError (status 404) when the profile does not exist.

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `id`: `string`; \}\>
