[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:200](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/hooks/useInterviewPrep.ts#L200)

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
