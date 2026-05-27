[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / refinePrepFromSessions

# Function: refinePrepFromSessions()

> **refinePrepFromSessions**(`candidateId`, `jobId`): `Promise`\<`RefinementResult`\>

Defined in: [src/lib/interviews/prepRefinementService.ts:148](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/interviews/prepRefinementService.ts#L148)

Main entry point: run after a mock session is persisted to update the
InterviewPrep record with the latest readiness score + coaching notes.

## Parameters

### candidateId

`string`

### jobId

`string`

## Returns

`Promise`\<`RefinementResult`\>
