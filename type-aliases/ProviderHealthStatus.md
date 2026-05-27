[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ProviderHealthStatus

# Type Alias: ProviderHealthStatus

> **ProviderHealthStatus** = `"healthy"` \| `"warning"` \| `"degraded"` \| `"critical"`

Defined in: [src/lib/observability/provider-health.ts:17](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/provider-health.ts#L17)

Provider health intelligence layer.

Maintains a sliding window of provider observations (last N per provider)
and derives a degradation score so the platform can detect:
  "Claude is degraded" before users report "Interview prep is slow."

Degradation score 0–100 (higher = more degraded):
  - 0–20  : healthy
  - 21–50 : warning
  - 51–80 : degraded
  - 81–100: critical
