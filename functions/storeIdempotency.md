[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / storeIdempotency

# Function: storeIdempotency()

> **storeIdempotency**(`key`, `executionId`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/lib/queue/idempotency.ts:50](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/queue/idempotency.ts#L50)

## Parameters

### key

`string`

### executionId

`string`

### ttlSeconds?

`number` = `86400`

## Returns

`Promise`\<`void`\>
