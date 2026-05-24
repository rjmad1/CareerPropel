[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / LLMProvider

# Interface: LLMProvider

Defined in: [src/lib/llm/provider.ts:39](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L39)

## Properties

### name

> **name**: `string`

Defined in: [src/lib/llm/provider.ts:40](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L40)

## Methods

### callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](LLMCallResult-1.md)\>

Defined in: [src/lib/llm/provider.ts:42](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L42)

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

Defined in: [src/lib/llm/provider.ts:41](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L41)

#### Returns

`string`

***

### streamLLM()

> **streamLLM**(`messages`, `options?`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/provider.ts:46](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L46)

#### Parameters

##### messages

[`LLMMessage`](LLMMessage-1.md)[]

##### options?

[`LLMCallOptions`](LLMCallOptions-1.md)

#### Returns

`AsyncIterable`\<`string`\>
