[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AnthropicProvider

# Class: AnthropicProvider

Defined in: [src/lib/llm/anthropic.ts:13](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L13)

## Implements

- [`LLMProviderClient`](../interfaces/LLMProviderClient.md)

## Constructors

### Constructor

> **new AnthropicProvider**(): `AnthropicProvider`

Defined in: [src/lib/llm/anthropic.ts:18](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L18)

#### Returns

`AnthropicProvider`

## Properties

### name

> **name**: `"anthropic"`

Defined in: [src/lib/llm/anthropic.ts:14](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L14)

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`name`](../interfaces/LLMProviderClient.md#name)

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

Defined in: [src/lib/llm/anthropic.ts:32](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L32)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`callLLM`](../interfaces/LLMProviderClient.md#callllm)

***

### getDefaultModel()

> **getDefaultModel**(): `string`

Defined in: [src/lib/llm/anthropic.ts:28](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L28)

#### Returns

`string`

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`getDefaultModel`](../interfaces/LLMProviderClient.md#getdefaultmodel)

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/anthropic.ts:78](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/llm/anthropic.ts#L78)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`streamLLM`](../interfaces/LLMProviderClient.md#streamllm)
