[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / storeIdempotency

# Function: storeIdempotency()

> **storeIdempotency**(`key`, `executionId`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/lib/queue/idempotency.ts:50](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/queue/idempotency.ts#L50)

## Parameters

### key

`string`

### executionId

`string`

### ttlSeconds?

`number` = `86400`

## Returns

`Promise`\<`void`\>
