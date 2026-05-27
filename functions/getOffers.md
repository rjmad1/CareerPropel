[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getOffers

# Function: getOffers()

> **getOffers**(`userId`, `query`): `Promise`\<\{ `data`: `object` & `object`[]; `pagination`: \{ `hasMore`: `boolean`; `limit`: `number`; `offset`: `number`; `total`: `number`; \}; \}\>

Defined in: [src/lib/db/offers.ts:8](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/db/offers.ts#L8)

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
