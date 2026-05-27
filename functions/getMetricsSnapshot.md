[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getMetricsSnapshot

# Function: getMetricsSnapshot()

> **getMetricsSnapshot**(): `object`

Defined in: [src/lib/observability/metrics.ts:221](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/metrics.ts#L221)

## Returns

`object`

### concurrency

> **concurrency**: `object`

#### concurrency.perSlot

> **perSlot**: `object`

##### Index Signature

\[`k`: `string`\]: `number`

#### concurrency.totalActive

> **totalActive**: `number`

### dlq

> **dlq**: `object`

#### dlq.depth

> **depth**: `number` = `dlqDepth`

### providers

> **providers**: `object`

#### Index Signature

\[`k`: `string`\]: `object`

### queues

> **queues**: `object`

#### Index Signature

\[`k`: `string`\]: `object`

### snapshotAt

> **snapshotAt**: `string`

### sse

> **sse**: `object`

#### sse.activeStreams

> **activeStreams**: `number` = `sseActiveStreams`

#### sse.heartbeatFailures

> **heartbeatFailures**: `number` = `sseHeartbeatFailures`

#### sse.totalDisconnects

> **totalDisconnects**: `number` = `sseDisconnects`

### workers

> **workers**: `object`

#### Index Signature

\[`k`: `string`\]: `object`
