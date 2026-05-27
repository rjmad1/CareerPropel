[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchIndeed

# Function: searchIndeed()

> **searchIndeed**(`query`, `location?`, `limit?`): `Promise`\<[`IndeedJob`](../interfaces/IndeedJob.md)[]\>

Defined in: [src/lib/scraping/indeed.ts:30](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/indeed.ts#L30)

Search Indeed for jobs matching a query and location.
Returns up to `limit` results.

## Parameters

### query

`string`

### location?

`string` = `'Remote'`

### limit?

`number` = `20`

## Returns

`Promise`\<[`IndeedJob`](../interfaces/IndeedJob.md)[]\>
