[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ExecutionBoundary

# Interface: ExecutionBoundary

Defined in: [src/lib/governance/boundedExecution.ts:13](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L13)

## Properties

### ancestorIds

> **ancestorIds**: `string`[]

Defined in: [src/lib/governance/boundedExecution.ts:25](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L25)

IDs of ancestor executions (prevents circular invocation)

***

### depth

> **depth**: `number`

Defined in: [src/lib/governance/boundedExecution.ts:17](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L17)

Current execution depth (0 = top-level)

***

### isolated

> **isolated**: `boolean`

Defined in: [src/lib/governance/boundedExecution.ts:31](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L31)

Whether this execution is isolated (cannot spawn children)

***

### maxDepth

> **maxDepth**: `number`

Defined in: [src/lib/governance/boundedExecution.ts:19](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L19)

Max allowed depth before recursion is blocked

***

### startedAt

> **startedAt**: `number`

Defined in: [src/lib/governance/boundedExecution.ts:21](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L21)

Execution start time (Unix ms)

***

### tokenBudgetRemaining

> **tokenBudgetRemaining**: `number`

Defined in: [src/lib/governance/boundedExecution.ts:29](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L29)

Budget remaining in tokens

***

### traceId

> **traceId**: `string`

Defined in: [src/lib/governance/boundedExecution.ts:15](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L15)

Root trace ID for the entire workflow

***

### ttlMs

> **ttlMs**: `number`

Defined in: [src/lib/governance/boundedExecution.ts:23](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L23)

TTL in ms from startedAt

***

### userId

> **userId**: `string`

Defined in: [src/lib/governance/boundedExecution.ts:27](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/governance/boundedExecution.ts#L27)

User ID owning this trace
