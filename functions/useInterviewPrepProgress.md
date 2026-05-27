[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:200](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useInterviewPrep.ts#L200)

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
