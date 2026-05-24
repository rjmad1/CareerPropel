[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / refinePrepFromSessions

# Function: refinePrepFromSessions()

> **refinePrepFromSessions**(`candidateId`, `jobId`): `Promise`\<`RefinementResult`\>

Defined in: [src/lib/interviews/prepRefinementService.ts:148](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/interviews/prepRefinementService.ts#L148)

Main entry point: run after a mock session is persisted to update the
InterviewPrep record with the latest readiness score + coaching notes.

## Parameters

### candidateId

`string`

### jobId

`string`

## Returns

`Promise`\<`RefinementResult`\>
