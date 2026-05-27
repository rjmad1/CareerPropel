[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / registerPromptVersion

# Function: registerPromptVersion()

> **registerPromptVersion**(`opts`): `Promise`\<[`PromptVersionRecord`](../interfaces/PromptVersionRecord.md)\>

Defined in: [src/lib/governance/promptRegistry.ts:89](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/governance/promptRegistry.ts#L89)

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
