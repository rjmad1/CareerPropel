[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / runWithTrace

# Function: runWithTrace()

> **runWithTrace**\<`T`\>(`correlationId`, `fn`): `T`

Defined in: [src/lib/logging/traceContext.ts:22](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/traceContext.ts#L22)

Runs a function with an active tracing context.
Generates a new correlation ID if not provided.

## Type Parameters

### T

`T`

## Parameters

### correlationId

`string` \| `undefined`

### fn

() => `T`

## Returns

`T`
