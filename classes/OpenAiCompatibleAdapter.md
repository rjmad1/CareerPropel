[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / OpenAiCompatibleAdapter

# Class: OpenAiCompatibleAdapter

Defined in: [src/lib/llm/orchestrator.ts:135](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/llm/orchestrator.ts#L135)

## Implements

- [`IAIProviderAdapter`](../interfaces/IAIProviderAdapter.md)

## Constructors

### Constructor

> **new OpenAiCompatibleAdapter**(`name`, `defaultBaseUrl`, `apiKeyEnvName`): `OpenAiCompatibleAdapter`

Defined in: [src/lib/llm/orchestrator.ts:136](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/llm/orchestrator.ts#L136)

#### Parameters

##### name

`string`

##### defaultBaseUrl

`string`

##### apiKeyEnvName

`string`

#### Returns

`OpenAiCompatibleAdapter`

## Properties

### name

> **name**: `string`

Defined in: [src/lib/llm/orchestrator.ts:137](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/llm/orchestrator.ts#L137)

#### Implementation of

[`IAIProviderAdapter`](../interfaces/IAIProviderAdapter.md).[`name`](../interfaces/IAIProviderAdapter.md#name)

## Methods

### call()

> **call**(`messages`, `options`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult.md)\>

Defined in: [src/lib/llm/orchestrator.ts:148](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/llm/orchestrator.ts#L148)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage.md)[]

##### options

[`LLMCallOptions`](../interfaces/LLMCallOptions.md)

#### Returns

`Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult.md)\>

#### Implementation of

[`IAIProviderAdapter`](../interfaces/IAIProviderAdapter.md).[`call`](../interfaces/IAIProviderAdapter.md#call)

***

### stream()

> **stream**(`messages`, `options`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/orchestrator.ts:192](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/llm/orchestrator.ts#L192)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage.md)[]

##### options

[`LLMCallOptions`](../interfaces/LLMCallOptions.md)

#### Returns

`AsyncIterable`\<`string`\>

#### Implementation of

[`IAIProviderAdapter`](../interfaces/IAIProviderAdapter.md).[`stream`](../interfaces/IAIProviderAdapter.md#stream)
