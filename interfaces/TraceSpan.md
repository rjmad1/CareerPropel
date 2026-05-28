[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / TraceSpan

# Interface: TraceSpan

Defined in: [src/lib/observability/tracing.ts:1](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/observability/tracing.ts#L1)

## Methods

### addEvent()

> **addEvent**(`name`, `attributes?`): `void`

Defined in: [src/lib/observability/tracing.ts:2](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/observability/tracing.ts#L2)

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

Defined in: [src/lib/observability/tracing.ts:3](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/observability/tracing.ts#L3)

#### Parameters

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

`void`
