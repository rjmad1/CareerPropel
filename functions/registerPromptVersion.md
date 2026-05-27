[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / registerPromptVersion

# Function: registerPromptVersion()

> **registerPromptVersion**(`opts`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:89](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/promptRegistry.ts#L89)

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
