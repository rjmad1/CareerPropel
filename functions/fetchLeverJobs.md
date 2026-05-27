[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchLeverJobs

# Function: fetchLeverJobs()

> **fetchLeverJobs**(`company`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:38](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/scraping/lever.ts#L38)

Fetch all open jobs from a company's Lever board.

## Parameters

### company

`string`

— the company's Lever board handle (e.g. "spotify")

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
