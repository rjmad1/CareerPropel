[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / CompensationIntelligenceResult

# Interface: CompensationIntelligenceResult

Defined in: [src/lib/analytics/compensation-intelligence.ts:22](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L22)

## Extends

- [`CompensationAnalysis`](CompensationAnalysis.md)

## Properties

### avgSalaryAllOffers

> **avgSalaryAllOffers**: `number` \| `null`

Defined in: [src/lib/analytics/compensation-intelligence.ts:26](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L26)

***

### benchmarkNote

> **benchmarkNote**: `string`

Defined in: [src/lib/analytics/types.ts:77](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/types.ts#L77)

Always present — reminds users that benchmarks are estimates.

#### Inherited from

[`CompensationAnalysis`](CompensationAnalysis.md).[`benchmarkNote`](CompensationAnalysis.md#benchmarknote)

***

### generatedAt

> **generatedAt**: `string`

Defined in: [src/lib/analytics/compensation-intelligence.ts:29](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L29)

***

### maxSalaryOffered

> **maxSalaryOffered**: `number` \| `null`

Defined in: [src/lib/analytics/compensation-intelligence.ts:27](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L27)

***

### minSalaryOffered

> **minSalaryOffered**: `number` \| `null`

Defined in: [src/lib/analytics/compensation-intelligence.ts:28](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L28)

***

### negotiatedCount

> **negotiatedCount**: `number`

Defined in: [src/lib/analytics/compensation-intelligence.ts:24](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L24)

***

### negotiationOutcomes

> **negotiationOutcomes**: [`NegotiationOutcome`](NegotiationOutcome.md)[]

Defined in: [src/lib/analytics/types.ts:75](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/types.ts#L75)

#### Inherited from

[`CompensationAnalysis`](CompensationAnalysis.md).[`negotiationOutcomes`](CompensationAnalysis.md#negotiationoutcomes)

***

### negotiationSuccessRate

> **negotiationSuccessRate**: `number` \| `null`

Defined in: [src/lib/analytics/compensation-intelligence.ts:25](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L25)

***

### offers

> **offers**: [`OfferSummary`](OfferSummary.md)[]

Defined in: [src/lib/analytics/types.ts:72](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/types.ts#L72)

#### Inherited from

[`CompensationAnalysis`](CompensationAnalysis.md).[`offers`](CompensationAnalysis.md#offers)

***

### percentileEstimate

> **percentileEstimate**: [`ScoredMetric`](ScoredMetric.md)\<`number` \| `null`\>

Defined in: [src/lib/analytics/types.ts:74](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/types.ts#L74)

#### Inherited from

[`CompensationAnalysis`](CompensationAnalysis.md).[`percentileEstimate`](CompensationAnalysis.md#percentileestimate)

***

### totalOffers

> **totalOffers**: `number`

Defined in: [src/lib/analytics/compensation-intelligence.ts:23](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/compensation-intelligence.ts#L23)

***

### trajectory

> **trajectory**: [`ScoredMetric`](ScoredMetric.md)\<[`CompensationPoint`](CompensationPoint.md)[]\>

Defined in: [src/lib/analytics/types.ts:73](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/analytics/types.ts#L73)

#### Inherited from

[`CompensationAnalysis`](CompensationAnalysis.md).[`trajectory`](CompensationAnalysis.md#trajectory)
