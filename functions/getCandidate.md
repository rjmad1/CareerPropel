[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getCandidate

# Function: getCandidate()

> **getCandidate**(`email`): `Promise`\<\{ `id`: `string`; \}\>

Defined in: [src/lib/route-helpers/candidate.ts:8](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/route-helpers/candidate.ts#L8)

Shared helper: look up the Candidate row for an authenticated user email.
Throws a NotFoundError (status 404) when the profile does not exist.

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `id`: `string`; \}\>
