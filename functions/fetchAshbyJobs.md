[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchAshbyJobs

# Function: fetchAshbyJobs()

> **fetchAshbyJobs**(`company`): `Promise`\<[`AshbyJob`](../interfaces/AshbyJob.md)[]\>

Defined in: [src/lib/scraping/ashby.ts:35](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/scraping/ashby.ts#L35)

Fetch all open jobs from a company's Ashby board.

## Parameters

### company

`string`

— the company's Ashby board handle (e.g. "sentry")

## Returns

`Promise`\<[`AshbyJob`](../interfaces/AshbyJob.md)[]\>
