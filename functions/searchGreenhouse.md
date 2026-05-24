[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchGreenhouse

# Function: searchGreenhouse()

> **searchGreenhouse**(`boardToken`, `keyword`, `limit?`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:44](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/scraping/greenhouse.ts#L44)

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
