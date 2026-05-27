[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getActivePromptVersion

# Function: getActivePromptVersion()

> **getActivePromptVersion**(`agentType`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:36](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/governance/promptRegistry.ts#L36)

Return the active PromptVersion for an agent type, seeding v1.0.0 if none exists.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>
