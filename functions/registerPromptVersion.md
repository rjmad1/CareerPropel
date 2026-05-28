[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / registerPromptVersion

# Function: registerPromptVersion()

> **registerPromptVersion**(`opts`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:89](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/promptRegistry.ts#L89)

Register a new prompt version. Optionally deactivate previous versions.

## Parameters

### opts

#### activate?

`boolean`

#### agentType

[`AgentType`](../type-aliases/AgentType.md)

#### canaryPercent?

`number`

#### changelog?

`string`

#### createdBy?

`string`

#### systemPrompt

`string`

#### userPromptTemplate

`string`

#### version

`string`

## Returns

`Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>
