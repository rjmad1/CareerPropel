[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchGreenhouseJobs

# Function: fetchGreenhouseJobs()

> **fetchGreenhouseJobs**(`boardToken`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:31](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/greenhouse.ts#L31)

Fetch all open jobs from a company's Greenhouse board.

## Parameters

### boardToken

`string`

— the company's Greenhouse board token (e.g. "stripe", "airbnb")

## Returns

`Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>
