[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / IngestionEngine

# Class: IngestionEngine

Defined in: [src/lib/orchestration/ingestion.ts:6](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/ingestion.ts#L6)

## Constructors

### Constructor

> **new IngestionEngine**(): `IngestionEngine`

#### Returns

`IngestionEngine`

## Methods

### expandIntent()

> `static` **expandIntent**(`title`, `userId`, `customContext?`): `Promise`\<[`IngestionResult`](../interfaces/IngestionResult.md)\>

Defined in: [src/lib/orchestration/ingestion.ts:10](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/ingestion.ts#L10)

Expands minimal user input into a fully qualified execution context and dynamic DAG.

#### Parameters

##### title

`string`

##### userId

`string`

##### customContext?

`string`

#### Returns

`Promise`\<[`IngestionResult`](../interfaces/IngestionResult.md)\>
