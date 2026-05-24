[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / restorePii

# Function: restorePii()

> **restorePii**(`redactedOutputText`, `tokenMap`): `string`

Defined in: [src/lib/llm/privacy.ts:134](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/privacy.ts#L134)

Restore redacted text placeholders to their original values in inbound LLM outputs

## Parameters

### redactedOutputText

`string`

### tokenMap

`Record`\<`string`, `string`\>

## Returns

`string`
