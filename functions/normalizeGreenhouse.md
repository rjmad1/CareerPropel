[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / normalizeGreenhouse

# Function: normalizeGreenhouse()

> **normalizeGreenhouse**(`job`, `company`): `object`

Defined in: [src/lib/scraping/greenhouse.ts:61](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/greenhouse.ts#L61)

Normalize a Greenhouse job into the common ImportedJob shape.

## Parameters

### job

[`GreenhouseJob`](../interfaces/GreenhouseJob.md)

### company

`string`

## Returns

`object`

### company

> **company**: `string`

### department

> **department**: `string` \| `null`

### description

> **description**: `string`

### externalId

> **externalId**: `string`

### location

> **location**: `string`

### postedAt

> **postedAt**: `string` = `job.updated_at`

### source

> **source**: `"greenhouse"`

### title

> **title**: `string` = `job.title`

### url

> **url**: `string` = `job.absolute_url`
