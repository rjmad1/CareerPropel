[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AnthropicProvider

# Class: AnthropicProvider

Defined in: [src/lib/llm/anthropic.ts:15](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L15)

## Implements

- `ILLMProvider`

## Constructors

### Constructor

> **new AnthropicProvider**(): `AnthropicProvider`

Defined in: [src/lib/llm/anthropic.ts:20](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L20)

#### Returns

`AnthropicProvider`

## Properties

### name

> **name**: `"anthropic"`

Defined in: [src/lib/llm/anthropic.ts:16](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L16)

#### Implementation of

`ILLMProvider.name`

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

Defined in: [src/lib/llm/anthropic.ts:34](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L34)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

#### Implementation of

`ILLMProvider.callLLM`

***

### getDefaultModel()

> **getDefaultModel**(): `string`

Defined in: [src/lib/llm/anthropic.ts:30](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L30)

#### Returns

`string`

#### Implementation of

`ILLMProvider.getDefaultModel`

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/anthropic.ts:80](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/llm/anthropic.ts#L80)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>

#### Implementation of

`ILLMProvider.streamLLM`
