[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / normalizeGreenhouse

# Function: normalizeGreenhouse()

> **normalizeGreenhouse**(`job`, `company`): `object`

Defined in: [src/lib/scraping/greenhouse.ts:61](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/scraping/greenhouse.ts#L61)

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
