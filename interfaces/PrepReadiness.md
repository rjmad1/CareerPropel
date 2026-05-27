[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PrepReadiness

# Interface: PrepReadiness

Defined in: [src/types/preparation.ts:11](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L11)

Overall preparation status for a job

## Properties

### components

> **components**: `object`

Defined in: [src/types/preparation.ts:14](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L14)

#### behavioral

> **behavioral**: [`ReadinessComponent`](ReadinessComponent.md)

#### companyResearch

> **companyResearch**: [`ReadinessComponent`](ReadinessComponent.md)

#### compensation

> **compensation**: [`ReadinessComponent`](ReadinessComponent.md)

#### resumeAlignment

> **resumeAlignment**: [`ReadinessComponent`](ReadinessComponent.md)

#### systemDesign

> **systemDesign**: [`ReadinessComponent`](ReadinessComponent.md)

#### technical

> **technical**: [`ReadinessComponent`](ReadinessComponent.md)

***

### jobId

> **jobId**: `string`

Defined in: [src/types/preparation.ts:12](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L12)

***

### nextInterviewDate?

> `optional` **nextInterviewDate?**: `Date`

Defined in: [src/types/preparation.ts:22](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L22)

***

### overallReadiness

> **overallReadiness**: `number`

Defined in: [src/types/preparation.ts:13](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L13)

***

### prepDeadline?

> `optional` **prepDeadline?**: `Date`

Defined in: [src/types/preparation.ts:23](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L23)

***

### status

> **status**: `"ready"` \| `"not_started"` \| `"in_progress"` \| `"interview_today"`

Defined in: [src/types/preparation.ts:24](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/types/preparation.ts#L24)
