[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLever

# Function: searchLever()

> **searchLever**(`company`, `keyword`, `limit?`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:50](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/lever.ts#L50)

Search Lever jobs for a given company and keyword.
Filters client-side since the public API doesn't support search.

## Parameters

### company

`string`

### keyword

`string`

### limit?

`number` = `20`

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
