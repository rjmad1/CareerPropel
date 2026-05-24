[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AggregateHealth

# Interface: AggregateHealth

Defined in: [src/lib/health/checks.ts:15](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/health/checks.ts#L15)

## Properties

### overall

> **overall**: [`HealthStatus`](../type-aliases/HealthStatus.md)

Defined in: [src/lib/health/checks.ts:16](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/health/checks.ts#L16)

***

### subsystems

> **subsystems**: `object`

Defined in: [src/lib/health/checks.ts:17](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/health/checks.ts#L17)

#### database

> **database**: [`SubsystemHealth`](SubsystemHealth.md)

#### queue

> **queue**: [`SubsystemHealth`](SubsystemHealth.md)

#### redis

> **redis**: [`SubsystemHealth`](SubsystemHealth.md)

#### workers

> **workers**: [`SubsystemHealth`](SubsystemHealth.md)
