[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:204](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/hooks/useInterviewPrep.ts#L204)

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
