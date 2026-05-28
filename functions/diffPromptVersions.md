[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / diffPromptVersions

# Function: diffPromptVersions()

> **diffPromptVersions**(`a`, `b`): `object`

Defined in: [src/lib/governance/promptRegistry.ts:148](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/promptRegistry.ts#L148)

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
