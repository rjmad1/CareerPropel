[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / restorePii

# Function: restorePii()

> **restorePii**(`redactedOutputText`, `tokenMap`): `string`

Defined in: [src/lib/llm/privacy.ts:134](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/llm/privacy.ts#L134)

Restore redacted text placeholders to their original values in inbound LLM outputs

## Parameters

### redactedOutputText

`string`

### tokenMap

`Record`\<`string`, `string`\>

## Returns

`string`
