[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AggregateHealth

# Interface: AggregateHealth

Defined in: [src/lib/health/checks.ts:15](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/health/checks.ts#L15)

## Properties

### overall

> **overall**: [`HealthStatus`](../type-aliases/HealthStatus.md)

Defined in: [src/lib/health/checks.ts:16](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/health/checks.ts#L16)

***

### subsystems

> **subsystems**: `object`

Defined in: [src/lib/health/checks.ts:17](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/health/checks.ts#L17)

#### database

> **database**: [`SubsystemHealth`](SubsystemHealth.md)

#### queue

> **queue**: [`SubsystemHealth`](SubsystemHealth.md)

#### redis

> **redis**: [`SubsystemHealth`](SubsystemHealth.md)

#### workers

> **workers**: [`SubsystemHealth`](SubsystemHealth.md)
