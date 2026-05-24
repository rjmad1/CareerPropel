[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JOB\_DEFAULTS

# Variable: JOB\_DEFAULTS

> `const` **JOB\_DEFAULTS**: `object`

Defined in: [src/lib/queue/job-definitions.ts:38](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/queue/job-definitions.ts#L38)

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
