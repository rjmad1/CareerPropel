[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JOB\_DEFAULTS

# Variable: JOB\_DEFAULTS

> `const` **JOB\_DEFAULTS**: `object`

Defined in: [src/lib/queue/job-definitions.ts:38](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/queue/job-definitions.ts#L38)

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

> **age**: `number` = `3600`

### removeOnFail

> **removeOnFail**: `object`

#### removeOnFail.age

> **age**: `number` = `86400`
