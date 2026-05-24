[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:204](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/hooks/useInterviewPrep.ts#L204)

Hook for tracking interview prep generation progress.
Polls the prep status endpoint while generation is in progress
and animates a progress bar to give feedback.

## Parameters

### jobId

`string`

## Returns

`object`

### message

> **message**: `string`

### progress

> **progress**: `number`

### startTracking

> **startTracking**: () => `void`

#### Returns

`void`

### status

> **status**: `"error"` \| `"idle"` \| `"generating"` \| `"complete"`
