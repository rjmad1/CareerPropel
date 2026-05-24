[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useInterviewPrepProgress

# Function: useInterviewPrepProgress()

> **useInterviewPrepProgress**(`jobId`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:204](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useInterviewPrep.ts#L204)

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
