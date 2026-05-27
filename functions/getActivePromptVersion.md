[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getActivePromptVersion

# Function: getActivePromptVersion()

> **getActivePromptVersion**(`agentType`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:36](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/governance/promptRegistry.ts#L36)

Return the active PromptVersion for an agent type, seeding v1.0.0 if none exists.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>
