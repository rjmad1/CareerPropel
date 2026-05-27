[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / estimatePercentile

# Function: estimatePercentile()

> **estimatePercentile**(`salary`): [`ScoredMetric`](../interfaces/ScoredMetric.md)\<`number` \| `null`\>

Defined in: [src/lib/analytics/governance.ts:56](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/analytics/governance.ts#L56)

Rough heuristic percentile estimate from a salary figure.

⚠️  This is NOT verified labor-market data.
Uses broad USD compensation bands only. Always labeled 'estimated'.
Direct users to Levels.fyi / Glassdoor / Blind for verified benchmarks.

## Parameters

### salary

`number`

## Returns

[`ScoredMetric`](../interfaces/ScoredMetric.md)\<`number` \| `null`\>
