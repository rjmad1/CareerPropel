[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchLeverJobs

# Function: fetchLeverJobs()

> **fetchLeverJobs**(`company`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:38](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/scraping/lever.ts#L38)

Fetch all open jobs from a company's Lever board.

## Parameters

### company

`string`

— the company's Lever board handle (e.g. "spotify")

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
