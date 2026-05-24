[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchAshby

# Function: searchAshby()

> **searchAshby**(`company`, `keyword`, `limit?`): `Promise`\<[`AshbyJob`](../interfaces/AshbyJob.md)[]\>

Defined in: [src/lib/scraping/ashby.ts:47](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/scraping/ashby.ts#L47)

Search Ashby jobs for a given company and keyword.
Filters client-side since the public API doesn't support search.

## Parameters

### company

`string`

### keyword

`string`

### limit?

`number` = `20`

## Returns

`Promise`\<[`AshbyJob`](../interfaces/AshbyJob.md)[]\>
