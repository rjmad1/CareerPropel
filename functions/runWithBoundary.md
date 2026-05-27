[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / runWithBoundary

# Function: runWithBoundary()

> **runWithBoundary**\<`T`\>(`boundary`, `fn`): `Promise`\<`T`\>

Defined in: [src/lib/governance/boundedExecution.ts:160](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/boundedExecution.ts#L160)

Runs fn within a TTL-bounded, depth-checked execution context.
Automatically decrements the user concurrency count on exit.

## Type Parameters

### T

`T`

## Parameters

### boundary

[`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

### fn

(`boundary`) => `Promise`\<`T`\>

## Returns

`Promise`\<`T`\>
