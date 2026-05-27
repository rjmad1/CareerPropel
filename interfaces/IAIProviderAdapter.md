[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / IAIProviderAdapter

# Interface: IAIProviderAdapter

Defined in: [src/lib/llm/orchestrator.ts:40](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/orchestrator.ts#L40)

## Properties

### name

> **name**: `string`

Defined in: [src/lib/llm/orchestrator.ts:41](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/orchestrator.ts#L41)

## Methods

### call()

> **call**(`messages`, `options`): `Promise`\<[`LLMCallResult`](LLMCallResult.md)\>

Defined in: [src/lib/llm/orchestrator.ts:42](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/orchestrator.ts#L42)

#### Parameters

##### messages

[`LLMMessage`](LLMMessage.md)[]

##### options

[`LLMCallOptions`](LLMCallOptions.md)

#### Returns

`Promise`\<[`LLMCallResult`](LLMCallResult.md)\>

***

### stream()

> **stream**(`messages`, `options`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/orchestrator.ts:43](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/llm/orchestrator.ts#L43)

#### Parameters

##### messages

[`LLMMessage`](LLMMessage.md)[]

##### options

[`LLMCallOptions`](LLMCallOptions.md)

#### Returns

`AsyncIterable`\<`string`\>
