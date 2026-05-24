[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateOffer

# Function: updateOffer()

> **updateOffer**(`userId`, `offerId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/offers.ts:113](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/db/offers.ts#L113)

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

`"received"` \| `"pending"` \| `"rejected"` \| `"accepted"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>
