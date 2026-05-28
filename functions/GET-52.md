[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`): `Promise`\<`NextResponse`\<\{ `metrics`: \{ `concurrency`: \{ `perSlot`: \{\[`k`: `string`\]: `number`; \}; `totalActive`: `number`; \}; `dlq`: \{ `depth`: `number`; \}; `providers`: \{\[`k`: `string`\]: `object`; \}; `queues`: \{\[`k`: `string`\]: `object`; \}; `snapshotAt`: `string`; `sse`: \{ `activeStreams`: `number`; `heartbeatFailures`: `number`; `totalDisconnects`: `number`; \}; `workers`: \{\[`k`: `string`\]: `object`; \}; \}; `runtime`: [`RuntimeSnapshot`](../interfaces/RuntimeSnapshot.md); \}\>\>

Defined in: [src/app/api/ops/metrics/route.ts:14](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/ops/metrics/route.ts#L14)

## Parameters

### \_req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `metrics`: \{ `concurrency`: \{ `perSlot`: \{\[`k`: `string`\]: `number`; \}; `totalActive`: `number`; \}; `dlq`: \{ `depth`: `number`; \}; `providers`: \{\[`k`: `string`\]: `object`; \}; `queues`: \{\[`k`: `string`\]: `object`; \}; `snapshotAt`: `string`; `sse`: \{ `activeStreams`: `number`; `heartbeatFailures`: `number`; `totalDisconnects`: `number`; \}; `workers`: \{\[`k`: `string`\]: `object`; \}; \}; `runtime`: [`RuntimeSnapshot`](../interfaces/RuntimeSnapshot.md); \}\>\>
