[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchGreenhouseJobs

# Function: fetchGreenhouseJobs()

> **fetchGreenhouseJobs**(`boardToken`): `Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>

Defined in: [src/lib/scraping/greenhouse.ts:31](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scraping/greenhouse.ts#L31)

Fetch all open jobs from a company's Greenhouse board.

## Parameters

### boardToken

`string`

— the company's Greenhouse board token (e.g. "stripe", "airbnb")

## Returns

`Promise`\<[`GreenhouseJob`](../interfaces/GreenhouseJob.md)[]\>
