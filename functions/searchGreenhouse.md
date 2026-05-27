[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchGreenhouse

# Function: searchGreenhouse()

> **searchGreenhouse**(`boardToken`, `keyword`, `limit?`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:44](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/greenhouse.ts#L44)

Search Greenhouse jobs for a given board token and keyword.
Filters client-side since the public API doesn't support search.

## Parameters

### boardToken

`string`

### keyword

`string`

### limit?

`number` = `20`

## Returns

`Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>
