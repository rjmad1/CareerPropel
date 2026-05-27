[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / FailureType

# Type Alias: FailureType

> **FailureType** = `"provider_timeout"` \| `"provider_rate_limit"` \| `"provider_circuit_open"` \| `"provider_api_error"` \| `"malformed_output"` \| `"validation_failure"` \| `"persistence_failure"` \| `"redis_disconnect"` \| `"auth_failure"` \| `"concurrency_limit"` \| `"execution_timeout"` \| `"execution_bug"` \| `"unknown"`

Defined in: [src/lib/observability/failure-classification.ts:10](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/observability/failure-classification.ts#L10)

Deterministic failure taxonomy for CareerPropel.

Every classified failure emits:
 - a FailureType (enum key for filtering/aggregation)
 - retryable flag (drives queue retry vs DLQ routing)
 - structured FailureMetadata for dashboards and incident diagnostics
