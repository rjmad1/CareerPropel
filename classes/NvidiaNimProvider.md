[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / NvidiaNimProvider

# Class: NvidiaNimProvider

Defined in: [src/lib/llm/nvidia-nim.ts:18](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L18)

## Implements

- [`LLMProviderClient`](../interfaces/LLMProviderClient.md)

## Constructors

### Constructor

> **new NvidiaNimProvider**(): `NvidiaNimProvider`

Defined in: [src/lib/llm/nvidia-nim.ts:24](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L24)

#### Returns

`NvidiaNimProvider`

## Properties

### name

> **name**: `"nvidia-nim"`

Defined in: [src/lib/llm/nvidia-nim.ts:19](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L19)

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`name`](../interfaces/LLMProviderClient.md#name)

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

Defined in: [src/lib/llm/nvidia-nim.ts:41](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L41)

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

Defined in: [src/lib/llm/nvidia-nim.ts:37](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L37)

#### Returns

`string`

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`getDefaultModel`](../interfaces/LLMProviderClient.md#getdefaultmodel)

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/nvidia-nim.ts:105](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/nvidia-nim.ts#L105)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>

#### Implementation of

[`LLMProviderClient`](../interfaces/LLMProviderClient.md).[`streamLLM`](../interfaces/LLMProviderClient.md#streamllm)
