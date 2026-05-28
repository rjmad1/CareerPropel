[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchLeverJobs

# Function: fetchLeverJobs()

> **fetchLeverJobs**(`company`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:38](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scraping/lever.ts#L38)

Fetch all open jobs from a company's Lever board.

## Parameters

### company

`string`

— the company's Lever board handle (e.g. "spotify")

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
