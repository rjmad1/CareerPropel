[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / GoldenTestCase

# Interface: GoldenTestCase

Defined in: [src/lib/governance/regressionHarness.ts:12](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L12)

## Properties

### agentType

> **agentType**: [`AgentType`](../type-aliases/AgentType.md)

Defined in: [src/lib/governance/regressionHarness.ts:14](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L14)

***

### forbiddenPhrases

> **forbiddenPhrases**: `string`[]

Defined in: [src/lib/governance/regressionHarness.ts:22](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L22)

Strings that must NOT appear in the output (hallucination guards)

***

### id

> **id**: `string`

Defined in: [src/lib/governance/regressionHarness.ts:13](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L13)

***

### input

> **input**: `Record`\<`string`, `string`\>

Defined in: [src/lib/governance/regressionHarness.ts:16](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L16)

***

### latencyBaselineMs

> **latencyBaselineMs**: `number`

Defined in: [src/lib/governance/regressionHarness.ts:26](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L26)

Baseline latency budget in ms; regression if exceeded by >50%

***

### name

> **name**: `string`

Defined in: [src/lib/governance/regressionHarness.ts:15](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L15)

***

### requiredKeys

> **requiredKeys**: `string`[]

Defined in: [src/lib/governance/regressionHarness.ts:18](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L18)

Expected structural keys that must be present in output

***

### requiredPhrases

> **requiredPhrases**: `string`[]

Defined in: [src/lib/governance/regressionHarness.ts:24](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L24)

Strings that MUST appear in the output

***

### scoreAssertions

> **scoreAssertions**: `object`[]

Defined in: [src/lib/governance/regressionHarness.ts:20](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L20)

Minimum confidence/score fields and their expected ranges

#### field

> **field**: `string`

#### max

> **max**: `number`

#### min

> **min**: `number`

***

### tokenBaseline

> **tokenBaseline**: `number`

Defined in: [src/lib/governance/regressionHarness.ts:28](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/regressionHarness.ts#L28)

Baseline token count; regression if exceeded by >30%
