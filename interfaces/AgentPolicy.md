[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentPolicy

# Interface: AgentPolicy

Defined in: [src/lib/governance/policyEngine.ts:14](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L14)

## Properties

### allowedTools

> **allowedTools**: `string`[]

Defined in: [src/lib/governance/policyEngine.ts:24](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L24)

Allowed tool names (empty = none)

***

### blockOnHallucinationRisk

> **blockOnHallucinationRisk**: `boolean`

Defined in: [src/lib/governance/policyEngine.ts:38](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L38)

Whether hallucination check failure blocks persistence

***

### executionTtlSeconds

> **executionTtlSeconds**: `number`

Defined in: [src/lib/governance/policyEngine.ts:32](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L32)

Execution TTL in seconds

***

### maxConcurrentPerUser

> **maxConcurrentPerUser**: `number`

Defined in: [src/lib/governance/policyEngine.ts:34](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L34)

Max concurrent executions per user for this agent type

***

### maxCostUsdPerExecution

> **maxCostUsdPerExecution**: `number`

Defined in: [src/lib/governance/policyEngine.ts:18](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L18)

Estimated max cost USD per execution

***

### maxFallbackDepth

> **maxFallbackDepth**: `number`

Defined in: [src/lib/governance/policyEngine.ts:22](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L22)

Max provider fallback depth

***

### maxInputContextChars

> **maxInputContextChars**: `number`

Defined in: [src/lib/governance/policyEngine.ts:26](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L26)

Max input context size in characters

***

### maxOutputChars

> **maxOutputChars**: `number`

Defined in: [src/lib/governance/policyEngine.ts:28](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L28)

Max output size in characters

***

### maxRetries

> **maxRetries**: `number`

Defined in: [src/lib/governance/policyEngine.ts:20](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L20)

Max retry attempts (queue-level)

***

### maxTokensPerExecution

> **maxTokensPerExecution**: `number`

Defined in: [src/lib/governance/policyEngine.ts:16](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L16)

Max total token spend per single execution

***

### piiHandling

> **piiHandling**: `"redact"` \| `"passthrough"` \| `"reject"`

Defined in: [src/lib/governance/policyEngine.ts:30](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L30)

How PII in input is handled

***

### requireValidationPass

> **requireValidationPass**: `boolean`

Defined in: [src/lib/governance/policyEngine.ts:36](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/policyEngine.ts#L36)

Whether the output must pass all validation layers to persist
