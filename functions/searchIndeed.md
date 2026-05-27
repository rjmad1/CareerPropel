[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchIndeed

# Function: searchIndeed()

> **searchIndeed**(`query`, `location?`, `limit?`): `Promise`\<[`IndeedJob`](../interfaces/IndeedJob.md)[]\>

Defined in: [src/lib/scraping/indeed.ts:30](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/indeed.ts#L30)

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
