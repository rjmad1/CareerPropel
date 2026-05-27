[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / TraceSpan

# Interface: TraceSpan

Defined in: [src/lib/observability/tracing.ts:1](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/observability/tracing.ts#L1)

## Methods

### addEvent()

> **addEvent**(`name`, `attributes?`): `void`

Defined in: [src/lib/observability/tracing.ts:2](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/observability/tracing.ts#L2)

#### Parameters

##### name

`string`

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### end()

> **end**(`attributes?`): `void`

Defined in: [src/lib/observability/tracing.ts:3](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/observability/tracing.ts#L3)

#### Parameters

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

`void`
