[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getReadinessSnapshot

# Function: getReadinessSnapshot()

> **getReadinessSnapshot**(): `Promise`\<\{ `checks`: \{ `database`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; `redis`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; \}; `status`: `string`; `timestamp`: `string`; \}\>

Defined in: [src/lib/queue/health.ts:36](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/queue/health.ts#L36)

## Returns

`Promise`\<\{ `checks`: \{ `database`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; `redis`: \{ `message?`: `undefined`; `status`: `string`; \} \| \{ `message`: `string`; `status`: `string`; \}; \}; `status`: `string`; `timestamp`: `string`; \}\>
