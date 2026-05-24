[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchGreenhouse

# Function: searchGreenhouse()

> **searchGreenhouse**(`boardToken`, `keyword`, `limit?`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:44](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/scraping/greenhouse.ts#L44)

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
