[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getOffers

# Function: getOffers()

> **getOffers**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/offers.ts:8](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/db/offers.ts#L8)

Get offers for a user

## Parameters

### userId

`string`

### query

#### limit

`number` = `...`

#### offset

`number` = `...`

#### sortBy

`"createdAt"` \| `"salary"` = `...`

#### sortOrder

`"desc"` \| `"asc"` = `...`

#### status?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>
