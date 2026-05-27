[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / KeywordGapReport

# Interface: KeywordGapReport

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L11)

## Properties

### coverageScore

> **coverageScore**: `number`

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:21](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L21)

0–1 fraction of required keywords covered

***

### exactMatchRate

> **exactMatchRate**: `number`

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:23](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L23)

0–1 exact match rate

***

### matched

> **matched**: `string`[]

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:13](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L13)

Keywords present in resume (exact or near-exact)

***

### missing

> **missing**: `string`[]

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:15](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L15)

Keywords in JD but absent from resume

***

### overused

> **overused**: `string`[]

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:17](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L17)

Keywords that appear so often they look like spam

***

### synonymized

> **synonymized**: `object`[]

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:19](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L19)

Synonymization warnings — JD says X, resume says Y instead

#### jdTerm

> **jdTerm**: `string`

#### resumeTerm

> **resumeTerm**: `string`

***

### synonymPenalty

> **synonymPenalty**: `number`

Defined in: [src/lib/ats/keywordGapAnalyzer.ts:25](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/ats/keywordGapAnalyzer.ts#L25)

Penalty applied for synonymizations
