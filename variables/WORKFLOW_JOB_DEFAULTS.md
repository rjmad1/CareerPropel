[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / WORKFLOW\_JOB\_DEFAULTS

# Variable: WORKFLOW\_JOB\_DEFAULTS

> `const` **WORKFLOW\_JOB\_DEFAULTS**: `object`

Defined in: [src/lib/workflow/queue.ts:8](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/workflow/queue.ts#L8)

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
