[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / diffPromptVersions

# Function: diffPromptVersions()

> **diffPromptVersions**(`a`, `b`): `object`

Defined in: [src/lib/governance/promptRegistry.ts:148](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/governance/promptRegistry.ts#L148)

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
