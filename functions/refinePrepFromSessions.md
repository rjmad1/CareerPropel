[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / refinePrepFromSessions

# Function: refinePrepFromSessions()

> **refinePrepFromSessions**(`candidateId`, `jobId`): `Promise`\<`RefinementResult`\>

Defined in: [src/lib/interviews/prepRefinementService.ts:148](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/interviews/prepRefinementService.ts#L148)

Main entry point: run after a mock session is persisted to update the
InterviewPrep record with the latest readiness score + coaching notes.

## Parameters

### candidateId

`string`

### jobId

`string`

## Returns

`Promise`\<`RefinementResult`\>
