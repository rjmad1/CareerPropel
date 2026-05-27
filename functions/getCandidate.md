[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidate

# Function: getCandidate()

> **getCandidate**(`email`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [src/lib/route-helpers/candidate.ts:8](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/route-helpers/candidate.ts#L8)

Shared helper: look up the Candidate row for an authenticated user email.
Throws a NotFoundError (status 404) when the profile does not exist.

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `id`: `string`; \}\>
