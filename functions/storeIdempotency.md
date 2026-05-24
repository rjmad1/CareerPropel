[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / storeIdempotency

# Function: storeIdempotency()

> **storeIdempotency**(`key`, `executionId`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/lib/queue/idempotency.ts:50](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/queue/idempotency.ts#L50)

## Parameters

### key

`string`

### executionId

`string`

### ttlSeconds?

`number` = `86400`

## Returns

`Promise`\<`void`\>
