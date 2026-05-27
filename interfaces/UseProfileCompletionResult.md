[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / UseProfileCompletionResult

# Interface: UseProfileCompletionResult

Defined in: [src/hooks/useProfileCompletion.ts:5](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L5)

## Properties

### breakdown

> **breakdown**: `Record`\<`string`, `number`\>

Defined in: [src/hooks/useProfileCompletion.ts:7](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L7)

***

### completeness

> **completeness**: `number`

Defined in: [src/hooks/useProfileCompletion.ts:6](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L6)

***

### error

> **error**: `Error` \| `null`

Defined in: [src/hooks/useProfileCompletion.ts:15](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L15)

***

### loading

> **loading**: `boolean`

Defined in: [src/hooks/useProfileCompletion.ts:14](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L14)

***

### milestones

> **milestones**: `object`

Defined in: [src/hooks/useProfileCompletion.ts:9](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L9)

#### next

> **next**: `number`

#### reached

> **reached**: `number`[]

***

### recommendations

> **recommendations**: [`ProfileRecommendation`](ProfileRecommendation.md)[]

Defined in: [src/hooks/useProfileCompletion.ts:8](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L8)

***

### skillGaps

> **skillGaps**: `object`

Defined in: [src/hooks/useProfileCompletion.ts:10](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L10)

#### gapLevel

> **gapLevel**: `"high"` \| `"low"` \| `"medium"`

#### missingSkills

> **missingSkills**: `string`[]

***

### trackProgress

> **trackProgress**: (`category`, `improvement`) => `void`

Defined in: [src/hooks/useProfileCompletion.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useProfileCompletion.ts#L17)

#### Parameters

##### category

`string`

##### improvement

`number`

#### Returns

`void`
