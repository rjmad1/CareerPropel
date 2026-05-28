[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidate

# Function: getCandidate()

> **getCandidate**(`email`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [src/lib/route-helpers/candidate.ts:8](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/route-helpers/candidate.ts#L8)

Shared helper: look up the Candidate row for an authenticated user email.
Throws a NotFoundError (status 404) when the profile does not exist.

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `id`: `string`; \}\>
