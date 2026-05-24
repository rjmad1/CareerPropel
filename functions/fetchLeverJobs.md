[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / fetchLeverJobs

# Function: fetchLeverJobs()

> **fetchLeverJobs**(`company`): `Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>

Defined in: [src/lib/scraping/lever.ts:38](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/scraping/lever.ts#L38)

Fetch all open jobs from a company's Lever board.

## Parameters

### company

`string`

— the company's Lever board handle (e.g. "spotify")

## Returns

`Promise`\<[`LeverJob`](../interfaces/LeverJob.md)[]\>
