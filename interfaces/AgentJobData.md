[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AgentJobData

# Interface: AgentJobData

Defined in: [src/lib/queue/job-definitions.ts:4](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L4)

## Properties

### agentType

> **agentType**: `string`

Defined in: [src/lib/queue/job-definitions.ts:6](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L6)

***

### context

> **context**: `Record`\<`string`, `unknown`\>

Defined in: [src/lib/queue/job-definitions.ts:8](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L8)

***

### executionId

> **executionId**: `string`

Defined in: [src/lib/queue/job-definitions.ts:5](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L5)

***

### executionVersion

> **executionVersion**: `number`

Defined in: [src/lib/queue/job-definitions.ts:11](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L11)

***

### idempotencyKey?

> `optional` **idempotencyKey?**: `string`

Defined in: [src/lib/queue/job-definitions.ts:9](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L9)

***

### originalJobId?

> `optional` **originalJobId?**: `string`

Defined in: [src/lib/queue/job-definitions.ts:13](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L13)

Stable ID for dedup-safe requeueing when chain deps aren't ready

***

### schemaVersion

> **schemaVersion**: `number`

Defined in: [src/lib/queue/job-definitions.ts:10](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L10)

***

### userId

> **userId**: `string`

Defined in: [src/lib/queue/job-definitions.ts:7](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/queue/job-definitions.ts#L7)
