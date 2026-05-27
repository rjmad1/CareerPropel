[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchGreenhouseJobs

# Function: fetchGreenhouseJobs()

> **fetchGreenhouseJobs**(`boardToken`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:31](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/scraping/greenhouse.ts#L31)

Fetch all open jobs from a company's Greenhouse board.

## Parameters

### boardToken

`string`

— the company's Greenhouse board token (e.g. "stripe", "airbnb")

## Returns

`Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>
