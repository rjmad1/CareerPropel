[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scoreJobMatch

# Function: scoreJobMatch()

> **scoreJobMatch**(`jobId`, `candidateId`): `Promise`\<[`MatchAnalysis`](../interfaces/MatchAnalysis.md)\>

Defined in: [src/lib/jobs/matchScorer.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/jobs/matchScorer.ts#L17)

Score a job against the candidate's profile using Claude.
Persists matchScore on the Job row and returns the full analysis.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`MatchAnalysis`](../interfaces/MatchAnalysis.md)\>
