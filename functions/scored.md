[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / scored

# Function: scored()

> **scored**\<`T`\>(`value`, `confidence`, `source`, `opts?`): [`ScoredMetric`](../interfaces/ScoredMetric.md)\<`T`\>

Defined in: [src/lib/analytics/governance.ts:38](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/analytics/governance.ts#L38)

Wrap any value with governance metadata.

## Type Parameters

### T

`T`

## Parameters

### value

`T`

### confidence

[`ConfidenceLevel`](../type-aliases/ConfidenceLevel.md)

### source

[`DataSourceType`](../type-aliases/DataSourceType.md)

### opts?

`Partial`\<`Omit`\<[`MetricMetadata`](../interfaces/MetricMetadata.md), `"confidence"` \| `"source"`\>\> = `{}`

## Returns

[`ScoredMetric`](../interfaces/ScoredMetric.md)\<`T`\>
