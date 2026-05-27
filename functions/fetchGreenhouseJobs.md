[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchGreenhouseJobs

# Function: fetchGreenhouseJobs()

> **fetchGreenhouseJobs**(`boardToken`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:31](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/greenhouse.ts#L31)

Fetch all open jobs from a company's Greenhouse board.

## Parameters

### boardToken

`string`

— the company's Greenhouse board token (e.g. "stripe", "airbnb")

## Returns

`Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>
