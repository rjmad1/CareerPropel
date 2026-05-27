[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / runRegressionSuite

# Function: runRegressionSuite()

> **runRegressionSuite**(`executor`, `filterAgentType?`): `Promise`\<\{ `overallScore`: `number`; `passRate`: `number`; `results`: [`RegressionRunResult`](../interfaces/RegressionRunResult.md)[]; \}\>

Defined in: [src/lib/governance/regressionHarness.ts:241](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/governance/regressionHarness.ts#L241)

Run all golden cases against a provided executor function.

## Parameters

### executor

(`agentType`, `input`) => `Promise`\<\{ `latencyMs`: `number`; `output`: `Record`\<`string`, `unknown`\>; `tokenCount`: `number`; \}\>

### filterAgentType?

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<\{ `overallScore`: `number`; `passRate`: `number`; `results`: [`RegressionRunResult`](../interfaces/RegressionRunResult.md)[]; \}\>
