[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / callLLM

# Function: callLLM()

> **callLLM**(`messages`, `options?`): `Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>

Defined in: [src/lib/llm/provider.ts:77](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/llm/provider.ts#L77)

Execute call through the orchestrator with automated PII Redaction

## Parameters

### messages

[`LLMMessage`](../interfaces/LLMMessage-1.md)[]

### options?

[`LLMCallOptions`](../interfaces/LLMCallOptions-1.md)

## Returns

`Promise`\<[`LLMCallResult`](../interfaces/LLMCallResult-1.md)\>
