[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / NvidiaNimProvider

# Class: NvidiaNimProvider

Defined in: [src/lib/llm/nvidia-nim.ts:20](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L20)

## Implements

- `ILLMProvider`

## Constructors

### Constructor

> **new NvidiaNimProvider**(): `NvidiaNimProvider`

Defined in: [src/lib/llm/nvidia-nim.ts:26](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L26)

#### Returns

`NvidiaNimProvider`

## Properties

### name

> **name**: `"nvidia-nim"`

Defined in: [src/lib/llm/nvidia-nim.ts:21](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L21)

#### Implementation of

`ILLMProvider.name`

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

Defined in: [src/lib/llm/nvidia-nim.ts:43](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L43)

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

Defined in: [src/lib/llm/nvidia-nim.ts:39](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L39)

#### Returns

`string`

#### Implementation of

`ILLMProvider.getDefaultModel`

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/nvidia-nim.ts:99](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/llm/nvidia-nim.ts#L99)

#### Parameters

##### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>

#### Implementation of

`ILLMProvider.streamLLM`
