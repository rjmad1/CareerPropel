[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scoreJobMatch

# Function: scoreJobMatch()

> **scoreJobMatch**(`jobId`, `candidateId`): `Promise`\<[`MatchAnalysis`](../interfaces/MatchAnalysis.md)\>

Defined in: [src/lib/jobs/matchScorer.ts:17](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/jobs/matchScorer.ts#L17)

Score a job against the candidate's profile using Claude.
Persists matchScore on the Job row and returns the full analysis.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`MatchAnalysis`](../interfaces/MatchAnalysis.md)\>
