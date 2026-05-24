[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logOffer

# Function: logOffer()

> **logOffer**(`userId`, `data`): `Promise`\<`object` & `object` \| `null`\>

Defined in: [src/lib/db/offers.ts:69](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/db/offers.ts#L69)

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

`"received"` \| `"pending"` \| `"rejected"` \| `"accepted"` = `...`

## Returns

`Promise`\<`object` & `object` \| `null`\>
