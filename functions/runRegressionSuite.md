[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / runRegressionSuite

# Function: runRegressionSuite()

> **runRegressionSuite**(`executor`, `filterAgentType?`): `Promise`\<\{ `overallScore`: `number`; `passRate`: `number`; `results`: [`RegressionRunResult`](../interfaces/RegressionRunResult.md)[]; \}\>

Defined in: [src/lib/governance/regressionHarness.ts:241](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/governance/regressionHarness.ts#L241)

Run all golden cases against a provided executor function.

## Parameters

### executor

(`agentType`, `input`) => `Promise`\<\{ `latencyMs`: `number`; `output`: `Record`\<`string`, `unknown`\>; `tokenCount`: `number`; \}\>

### filterAgentType?

[`AgentType`](../type-aliases/AgentType.md)

## Returns

`Promise`\<\{ `overallScore`: `number`; `passRate`: `number`; `results`: [`RegressionRunResult`](../interfaces/RegressionRunResult.md)[]; \}\>
