[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / shouldInvalidateCache

# Function: shouldInvalidateCache()

> **shouldInvalidateCache**(`agentType`, `contextChanged`): `boolean`

Defined in: [src/lib/workflow/ai-coordinator.ts:60](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/ai-coordinator.ts#L60)

Invalidate cached executions for a job (e.g. after job stage change).
In practice we don't delete them — we just note this for future callers.
The recency window naturally expires stale caches.

## Parameters

### agentType

[`AgentType`](../type-aliases/AgentType.md)

### contextChanged

`boolean`

## Returns

`boolean`
