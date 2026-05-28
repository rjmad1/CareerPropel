[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / restorePii

# Function: restorePii()

> **restorePii**(`redactedOutputText`, `tokenMap`): `string`

Defined in: [src/lib/llm/privacy.ts:134](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/llm/privacy.ts#L134)

Restore redacted text placeholders to their original values in inbound LLM outputs

## Parameters

### redactedOutputText

`string`

### tokenMap

`Record`\<`string`, `string`\>

## Returns

`string`
