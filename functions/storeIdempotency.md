[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / storeIdempotency

# Function: storeIdempotency()

> **storeIdempotency**(`key`, `executionId`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/lib/queue/idempotency.ts:50](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/queue/idempotency.ts#L50)

## Parameters

### key

`string`

### executionId

`string`

### ttlSeconds?

`number` = `86400`

## Returns

`Promise`\<`void`\>
