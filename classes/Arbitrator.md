[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / Arbitrator

# Class: Arbitrator

Defined in: [src/lib/orchestration/arbitrator.ts:6](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/arbitrator.ts#L6)

## Constructors

### Constructor

> **new Arbitrator**(): `Arbitrator`

#### Returns

`Arbitrator`

## Methods

### initializeWorkflow()

> `static` **initializeWorkflow**(`result`, `candidateId`, `userId`, `jobId?`): `Promise`\<`string`\>

Defined in: [src/lib/orchestration/arbitrator.ts:10](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/arbitrator.ts#L10)

Translates the dynamic DAG ingestion result into a physical WorkflowDefinition and Execution.

#### Parameters

##### result

[`IngestionResult`](../interfaces/IngestionResult.md)

##### candidateId

`string`

##### userId

`string`

##### jobId?

`string`

#### Returns

`Promise`\<`string`\>
