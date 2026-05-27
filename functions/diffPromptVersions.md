[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / diffPromptVersions

# Function: diffPromptVersions()

> **diffPromptVersions**(`a`, `b`): `object`

Defined in: [src/lib/governance/promptRegistry.ts:148](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/governance/promptRegistry.ts#L148)

Diff two prompt versions for debugging/audit.

## Parameters

### a

[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)

### b

[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)

## Returns

`object`

### fromVersion

> **fromVersion**: `string`

### systemChanged

> **systemChanged**: `boolean`

### toVersion

> **toVersion**: `string`

### userTemplateChanged

> **userTemplateChanged**: `boolean`
