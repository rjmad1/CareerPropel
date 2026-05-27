[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / assertBoundaryAllowsChild

# Function: assertBoundaryAllowsChild()

> **assertBoundaryAllowsChild**(`boundary`, `childExecutionId`, `estimatedTokens?`): `void`

Defined in: [src/lib/governance/boundedExecution.ts:107](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/governance/boundedExecution.ts#L107)

Validates that a child execution is allowed within the given boundary. Throws on violation.

## Parameters

### boundary

[`ExecutionBoundary`](../interfaces/ExecutionBoundary.md)

### childExecutionId

`string`

### estimatedTokens?

`number`

## Returns

`void`
