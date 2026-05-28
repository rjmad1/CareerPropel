[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logOffer

# Function: logOffer()

> **logOffer**(`userId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/offers.ts:68](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/db/offers.ts#L68)

Log a new offer

## Parameters

### userId

`string`

### data

#### benefits?

`object`[] = `...`

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

#### jobId

`string` = `...`

#### negotiated

`boolean` = `...`

#### notes?

`string` = `...`

#### salary

`number` = `...`

#### startDate?

`string` = `...`

#### status

`"rejected"` \| `"received"` \| `"pending"` \| `"accepted"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>
