[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / registerPromptVersion

# Function: registerPromptVersion()

> **registerPromptVersion**(`opts`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:89](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/governance/promptRegistry.ts#L89)

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
