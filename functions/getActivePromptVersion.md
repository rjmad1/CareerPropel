[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getActivePromptVersion

# Function: getActivePromptVersion()

> **getActivePromptVersion**(`agentType`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:36](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/governance/promptRegistry.ts#L36)

Return the active PromptVersion for an agent type, seeding v1.0.0 if none exists.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>
