[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ProfileSummary

# Interface: ProfileSummary

Defined in: [src/types/profile.ts:142](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L142)

Complete profile summary

## Properties

### candidateId

> **candidateId**: `string`

Defined in: [src/types/profile.ts:143](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L143)

***

### careerNarrative?

> `optional` **careerNarrative?**: `string`

Defined in: [src/types/profile.ts:154](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L154)

***

### completenessScore

> **completenessScore**: [`ProfileScore`](ProfileScore.md)

Defined in: [src/types/profile.ts:144](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L144)

***

### extractionQuality

> **extractionQuality**: `object`

Defined in: [src/types/profile.ts:148](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L148)

#### averageConfidence

> **averageConfidence**: `number`

#### documentCount

> **documentCount**: `number`

#### lastExtraction

> **lastExtraction**: `Date`

#### totalEntities

> **totalEntities**: `number`

***

### recentAchievements

> **recentAchievements**: [`Achievement`](Achievement.md)[]

Defined in: [src/types/profile.ts:146](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L146)

***

### recommendations

> **recommendations**: [`ProfileRecommendation`](ProfileRecommendation.md)[]

Defined in: [src/types/profile.ts:147](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L147)

***

### topSkills

> **topSkills**: [`SemanticSkill`](SemanticSkill.md)[]

Defined in: [src/types/profile.ts:145](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/types/profile.ts#L145)
