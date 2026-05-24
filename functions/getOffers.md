[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getOffers

# Function: getOffers()

> **getOffers**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/offers.ts:9](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/db/offers.ts#L9)

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

`"asc"` \| `"desc"` = `...`

#### status?

`string` = `...`

## Returns

`Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>
