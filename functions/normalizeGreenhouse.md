[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / normalizeGreenhouse

# Function: normalizeGreenhouse()

> **normalizeGreenhouse**(`job`, `company`): `object`

Defined in: [src/lib/scraping/greenhouse.ts:61](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/scraping/greenhouse.ts#L61)

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
