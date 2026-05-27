[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateOffer

# Function: updateOffer()

> **updateOffer**(`userId`, `offerId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/offers.ts:112](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/db/offers.ts#L112)

Update an offer

## Parameters

### userId

`string`

### offerId

`string`

### data

#### bonus?

\{ `amount?`: `number`; `type?`: `"cash"` \| `"percentage"`; \} = `...`

#### bonus.amount?

`number` = `...`

#### bonus.type?

`"cash"` \| `"percentage"` = `...`

#### equity?

\{ `amount?`: `number`; `cliffMonths?`: `number`; `vestingYears?`: `number`; \} = `...`

#### equity.amount?

`number` = `...`

#### equity.cliffMonths?

`number` = `...`

#### equity.vestingYears?

`number` = `...`

#### negotiated?

`boolean` = `...`

#### notes?

`string` = `...`

#### salary?

`number` = `...`

#### status?

`"rejected"` \| `"received"` \| `"pending"` \| `"accepted"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>
