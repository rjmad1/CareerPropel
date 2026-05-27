[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / LLMProviderClient

# Interface: LLMProviderClient

Defined in: [src/lib/llm/provider.ts:34](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/llm/provider.ts#L34)

## Properties

### name

> **name**: [`LLMProviderName`](../type-aliases/LLMProviderName.md)

Defined in: [src/lib/llm/provider.ts:35](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/llm/provider.ts#L35)

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](LLMCallResult-1.md)\>

Defined in: [src/lib/llm/provider.ts:36](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/llm/provider.ts#L36)

#### Parameters

##### messages

[`LLMMessage`](LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](LLMCallOptions-1.md)

#### Returns

`Promise`\<[`LLMCallResult`](LLMCallResult-1.md)\>

***

### getDefaultModel()

> **getDefaultModel**(): `string`

Defined in: [src/lib/llm/provider.ts:41](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/llm/provider.ts#L41)

#### Returns

`string`

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/provider.ts:37](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/llm/provider.ts#L37)

#### Parameters

##### messages

[`LLMMessage`](LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>
