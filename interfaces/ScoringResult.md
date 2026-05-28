[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ScoringResult

# Interface: ScoringResult

Defined in: [src/lib/scoring/scoringEngine.ts:24](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L24)

## Properties

### adaptationMultiplier

> **adaptationMultiplier**: `number`

Defined in: [src/lib/scoring/scoringEngine.ts:28](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L28)

***

### baseScore

> **baseScore**: `number`

Defined in: [src/lib/scoring/scoringEngine.ts:25](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L25)

***

### blendedWeights

> **blendedWeights**: `Record`\<`string`, `number`\>

Defined in: [src/lib/scoring/scoringEngine.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L31)

***

### credibilityMultiplier

> **credibilityMultiplier**: `number`

Defined in: [src/lib/scoring/scoringEngine.ts:27](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L27)

***

### dimensionDetails

> **dimensionDetails**: `object`[]

Defined in: [src/lib/scoring/scoringEngine.ts:32](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L32)

#### confidence

> **confidence**: `number`

#### dimension

> **dimension**: `string`

#### evidence

> **evidence**: `string`[]

#### reasoning

> **reasoning**: `string`

#### score

> **score**: `number`

#### weightedContribution

> **weightedContribution**: `number`

***

### finalScore

> **finalScore**: `number`

Defined in: [src/lib/scoring/scoringEngine.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L26)

***

### isAutoRejected

> **isAutoRejected**: `boolean`

Defined in: [src/lib/scoring/scoringEngine.ts:29](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L29)

***

### recommendationBand

> **recommendationBand**: `"High Probability Fit"` \| `"Strong Stretch Fit"` \| `"Conditional Fit"` \| `"Weak Alignment"` \| `"Misaligned"`

Defined in: [src/lib/scoring/scoringEngine.ts:30](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scoring/scoringEngine.ts#L30)
