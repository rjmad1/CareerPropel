[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchGreenhouse

# Function: searchGreenhouse()

> **searchGreenhouse**(`boardToken`, `keyword`, `limit?`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:44](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/scraping/greenhouse.ts#L44)

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
