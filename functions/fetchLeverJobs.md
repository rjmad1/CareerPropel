[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchLeverJobs

# Function: fetchLeverJobs()

> **fetchLeverJobs**(`company`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:38](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/scraping/lever.ts#L38)

Fetch all open jobs from a company's Lever board.

## Parameters

### company

`string`

— the company's Lever board handle (e.g. "spotify")

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
