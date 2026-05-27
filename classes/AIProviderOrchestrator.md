[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AIProviderOrchestrator

# Class: AIProviderOrchestrator

Defined in: [src/lib/llm/orchestrator.ts:274](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/llm/orchestrator.ts#L274)

## Constructors

### Constructor

> **new AIProviderOrchestrator**(): `AIProviderOrchestrator`

#### Returns

`AIProviderOrchestrator`

## Methods

### executeWithFallback()

> `static` **executeWithFallback**(`presetKey`, `messages`, `candidateId?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult.md)\>

Defined in: [src/lib/llm/orchestrator.ts:323](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/llm/orchestrator.ts#L323)

Core routing executor with exponential retries and multi-tier failover chains

#### Parameters

##### presetKey

`string`

##### messages

[`LLMMessage`](../interfaces/LLMMessage.md)[]

##### candidateId?

`string`

#### Returns

`Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult.md)\>

***

### streamWithFallback()

> `static` **streamWithFallback**(`presetKey`, `messages`): `AsyncIterable`\<`string`\>

Defined in: [src/lib/llm/orchestrator.ts:422](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/llm/orchestrator.ts#L422)

Core routing streaming executor with multi-tier failover chains

#### Parameters

##### presetKey

`string`

##### messages

[`LLMMessage`](../interfaces/LLMMessage.md)[]

#### Returns

`AsyncIterable`\<`string`\>
