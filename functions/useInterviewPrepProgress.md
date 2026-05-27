[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:200](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useInterviewPrep.ts#L200)

Hook for listening to interview prep generation progress
(for real-time updates via WebSocket)

## Parameters

### jobId

`string`

## Returns

`object`

### message

> **message**: `string`

### progress

> **progress**: `number`

### status

> **status**: `"error"` \| `"idle"` \| `"complete"` \| `"generating"`
