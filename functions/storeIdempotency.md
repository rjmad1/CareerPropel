[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / storeIdempotency

# Function: storeIdempotency()

> **storeIdempotency**(`key`, `executionId`, `ttlSeconds?`): `Promise`\<`void`\>

Defined in: [src/lib/queue/idempotency.ts:50](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/queue/idempotency.ts#L50)

## Parameters

### key

`string`

### executionId

`string`

### ttlSeconds?

`number` = `86400`

## Returns

`Promise`\<`void`\>
