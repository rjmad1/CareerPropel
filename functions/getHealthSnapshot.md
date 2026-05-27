[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getHealthSnapshot

# Function: getHealthSnapshot()

> **getHealthSnapshot**(): `Promise`\<\{ `checks`: \{ `database`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; `queue`: \{ `averageLatencyMs`: `number`; `counts`: \{\[`index`: `string`\]: `number`; \}; \}; `redis`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; \}; `durationMs`: `number`; `metrics`: \{ `concurrency`: \{ `perSlot`: \{\[`k`: `string`\]: `number`; \}; `totalActive`: `number`; \}; `dlq`: \{ `depth`: `number`; \}; `providers`: \{\[`k`: `string`\]: `object`; \}; `queues`: \{\[`k`: `string`\]: `object`; \}; `snapshotAt`: `string`; `sse`: \{ `activeStreams`: `number`; `heartbeatFailures`: `number`; `totalDisconnects`: `number`; \}; `workers`: \{\[`k`: `string`\]: `object`; \}; \}; `status`: `string`; `timestamp`: `string`; \}\>

Defined in: [src/lib/queue/health.ts:6](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/queue/health.ts#L6)

## Returns

`Promise`\<\{ `checks`: \{ `database`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; `queue`: \{ `averageLatencyMs`: `number`; `counts`: \{\[`index`: `string`\]: `number`; \}; \}; `redis`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; \}; `durationMs`: `number`; `metrics`: \{ `concurrency`: \{ `perSlot`: \{\[`k`: `string`\]: `number`; \}; `totalActive`: `number`; \}; `dlq`: \{ `depth`: `number`; \}; `providers`: \{\[`k`: `string`\]: `object`; \}; `queues`: \{\[`k`: `string`\]: `object`; \}; `snapshotAt`: `string`; `sse`: \{ `activeStreams`: `number`; `heartbeatFailures`: `number`; `totalDisconnects`: `number`; \}; `workers`: \{\[`k`: `string`\]: `object`; \}; \}; `status`: `string`; `timestamp`: `string`; \}\>
