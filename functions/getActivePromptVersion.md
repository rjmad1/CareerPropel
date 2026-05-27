[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getActivePromptVersion

# Function: getActivePromptVersion()

> **getActivePromptVersion**(`agentType`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:36](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/promptRegistry.ts#L36)

Return the active PromptVersion for an agent type, seeding v1.0.0 if none exists.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>
