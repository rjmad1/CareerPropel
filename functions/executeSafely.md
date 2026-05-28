[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / executeSafely

# Function: executeSafely()

> **executeSafely**\<`T`\>(`operation`, `fallbackValue`, `operationName?`): `Promise`\<`T`\>

Defined in: [src/infrastructure/redis/health.ts:67](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/infrastructure/redis/health.ts#L67)

Wraps an operational execution and returns a fallback value upon failures
to prevent hard crashes and enable graceful degradation (7. OPERATIONAL SAFETY)

## Type Parameters

### T

`T`

## Parameters

### operation

() => `Promise`\<`T`\>

### fallbackValue

`T`

### operationName?

`string` = `'Redis Command'`

## Returns

`Promise`\<`T`\>
