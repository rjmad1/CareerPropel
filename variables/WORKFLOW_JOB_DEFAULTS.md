[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / WORKFLOW\_JOB\_DEFAULTS

# Variable: WORKFLOW\_JOB\_DEFAULTS

> `const` **WORKFLOW\_JOB\_DEFAULTS**: `object`

Defined in: [src/lib/workflow/queue.ts:8](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/queue.ts#L8)

## Type Declaration

### attempts

> **attempts**: `number` = `3`

### backoff

> **backoff**: `object`

#### backoff.delay

> **delay**: `number` = `2000`

#### backoff.type

> **type**: `"exponential"`

### removeOnComplete

> **removeOnComplete**: `object`

#### removeOnComplete.age

> **age**: `number` = `7200`

### removeOnFail

> **removeOnFail**: `object`

#### removeOnFail.age

> **age**: `number` = `86400`
