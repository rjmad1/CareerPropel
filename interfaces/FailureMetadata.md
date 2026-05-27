[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / FailureMetadata

# Interface: FailureMetadata

Defined in: [src/lib/observability/failure-classification.ts:25](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L25)

## Properties

### classifiedAt

> **classifiedAt**: `string`

Defined in: [src/lib/observability/failure-classification.ts:33](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L33)

ISO timestamp of classification

***

### context?

> `optional` **context?**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/observability/failure-classification.ts:35](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L35)

Additional context from the call site

***

### errorClass

> **errorClass**: `string`

Defined in: [src/lib/observability/failure-classification.ts:31](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L31)

Original error class name

***

### failureType

> **failureType**: [`FailureType`](../type-aliases/FailureType.md)

Defined in: [src/lib/observability/failure-classification.ts:26](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L26)

***

### reason

> **reason**: `string`

Defined in: [src/lib/observability/failure-classification.ts:29](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L29)

Derived from error.message

***

### retryable

> **retryable**: `boolean`

Defined in: [src/lib/observability/failure-classification.ts:27](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/observability/failure-classification.ts#L27)
