[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / runWithTrace

# Function: runWithTrace()

> **runWithTrace**\<`T`\>(`correlationId`, `fn`): `T`

Defined in: [src/lib/logging/traceContext.ts:22](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/logging/traceContext.ts#L22)

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
