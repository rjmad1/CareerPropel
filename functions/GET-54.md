[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GET

# Function: GET()

> **GET**(`_req`): `Promise`\<`NextResponse`\<\{ `counts`: \{ `dlq`: \{\[`index`: `string`\]: `number`; \}; `execution`: \{\[`index`: `string`\]: `number`; \}; \}; `dlq`: `object`[]; `oldestQueued`: \{ `agentType`: `string`; `executionId`: `string`; `jobId`: `string` \| `undefined`; `submittedAt`: `string`; `waitingForMs`: `number`; \} \| `null`; `stuckJobs`: `object`[]; `suspiciousJobs`: `object`[]; `thresholds`: \{ `retryStormAtAttempts`: `number`; `stuckAfterMs`: `number`; \}; `timestamp`: `string`; \}\>\>

Defined in: [src/app/api/ops/queue/route.ts:20](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/app/api/ops/queue/route.ts#L20)

## Parameters

### \_req

`NextRequest`

## Returns

`Promise`\<`NextResponse`\<\{ `counts`: \{ `dlq`: \{\[`index`: `string`\]: `number`; \}; `execution`: \{\[`index`: `string`\]: `number`; \}; \}; `dlq`: `object`[]; `oldestQueued`: \{ `agentType`: `string`; `executionId`: `string`; `jobId`: `string` \| `undefined`; `submittedAt`: `string`; `waitingForMs`: `number`; \} \| `null`; `stuckJobs`: `object`[]; `suspiciousJobs`: `object`[]; `thresholds`: \{ `retryStormAtAttempts`: `number`; `stuckAfterMs`: `number`; \}; `timestamp`: `string`; \}\>\>
