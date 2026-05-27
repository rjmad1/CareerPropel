[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLever

# Function: searchLever()

> **searchLever**(`company`, `keyword`, `limit?`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:50](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/lever.ts#L50)

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
