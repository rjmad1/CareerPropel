[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useMockInterview

# Function: useMockInterview()

> **useMockInterview**(`prep`): `object`

Defined in: [src/hooks/useInterviewPrep.ts:246](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/hooks/useInterviewPrep.ts#L246)

## Parameters

### prep

[`InterviewPrep`](../interfaces/InterviewPrep.md) \| `null`

## Returns

`object`

### endSession

> **endSession**: () => `void`

#### Returns

`void`

### feedback

> **feedback**: `string` \| `null`

### generateFeedback

> **generateFeedback**: () => `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

### isRecording

> **isRecording**: `boolean`

### nextQuestion

> **nextQuestion**: () => `void`

#### Returns

`void`

### previousQuestion

> **previousQuestion**: () => `void`

#### Returns

`void`

### recordResponse

> **recordResponse**: (`response`) => `void`

#### Parameters

##### response

`string`

#### Returns

`void`

### session

> **session**: [`MockInterviewSession`](../interfaces/MockInterviewSession.md) \| `null`

### startSession

> **startSession**: () => `void`

#### Returns

`void`

### toggleRecording

> **toggleRecording**: () => `void`

#### Returns

`void`
