[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / recordConversionOutcome

# Function: recordConversionOutcome()

> **recordConversionOutcome**(`candidateId`, `jobId`, `_stage`, `outcome`): `Promise`\<`void`\>

Defined in: [src/lib/scoring/telemetry.ts:15](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/telemetry.ts#L15)

Record a progression outcome (e.g. interview scheduled, recruiter response, rejected)
to correlate historical fit scores with actual recruiter conversion rates.

## Parameters

### candidateId

`string`

### jobId

`string`

### \_stage

`string`

### outcome

`"offer"` \| `"rejected"` \| `"progressed"`

## Returns

`Promise`\<`void`\>
