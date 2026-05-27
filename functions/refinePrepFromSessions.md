[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / refinePrepFromSessions

# Function: refinePrepFromSessions()

> **refinePrepFromSessions**(`candidateId`, `jobId`): `Promise`\<`RefinementResult`\>

Defined in: [src/lib/interviews/prepRefinementService.ts:148](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/interviews/prepRefinementService.ts#L148)

Main entry point: run after a mock session is persisted to update the
InterviewPrep record with the latest readiness score + coaching notes.

## Parameters

### candidateId

`string`

### jobId

`string`

## Returns

`Promise`\<`RefinementResult`\>
