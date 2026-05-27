[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ATSScoreBreakdown

# Interface: ATSScoreBreakdown

Defined in: [src/lib/ats/atsScorer.ts:17](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L17)

## Properties

### chronologyScore

> **chronologyScore**: `number`

Defined in: [src/lib/ats/atsScorer.ts:27](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L27)

0–10 contribution from clean chronology

***

### exactMatchRate

> **exactMatchRate**: `number`

Defined in: [src/lib/ats/atsScorer.ts:23](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L23)

0–25 contribution from exact required keyword matches

***

### formatCompliance

> **formatCompliance**: `number`

Defined in: [src/lib/ats/atsScorer.ts:25](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L25)

0–20 contribution from format/parser compliance

***

### keywordCoverage

> **keywordCoverage**: `number`

Defined in: [src/lib/ats/atsScorer.ts:21](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L21)

0–40 contribution from keyword coverage

***

### overall

> **overall**: `number`

Defined in: [src/lib/ats/atsScorer.ts:19](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L19)

0–100 composite score

***

### recommendations

> **recommendations**: `string`[]

Defined in: [src/lib/ats/atsScorer.ts:33](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L33)

Prioritized list of improvement actions

***

### riskLevel

> **riskLevel**: `"high"` \| `"low"` \| `"medium"` \| `"critical"`

Defined in: [src/lib/ats/atsScorer.ts:31](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L31)

Human-readable risk level

***

### synonymPenalty

> **synonymPenalty**: `number`

Defined in: [src/lib/ats/atsScorer.ts:29](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/atsScorer.ts#L29)

0–5 deduction for synonymizations
