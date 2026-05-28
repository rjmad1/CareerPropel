[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / calibrateScoringWeights

# Function: calibrateScoringWeights()

> **calibrateScoringWeights**(`candidateId`): `Promise`\<\{ `archetypePerformances`: `object`[]; `conversionRate`: `number`; `falsePositiveRate`: `number`; `suggestions`: [`CalibrationSuggestion`](../interfaces/CalibrationSuggestion.md)[]; \}\>

Defined in: [src/lib/scoring/telemetry.ts:85](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/telemetry.ts#L85)

Evaluates the performance of the Role Intelligence scoring model.
Computes false-positives, average conversion rates by archetype, and suggests weight calibrations.

## Parameters

### candidateId

`string`

## Returns

`Promise`\<\{ `archetypePerformances`: `object`[]; `conversionRate`: `number`; `falsePositiveRate`: `number`; `suggestions`: [`CalibrationSuggestion`](../interfaces/CalibrationSuggestion.md)[]; \}\>
