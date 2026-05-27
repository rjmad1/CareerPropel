[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / SwimlaneProps

# Interface: SwimlaneProps

Defined in: [src/components/Kanban/Swimlane.tsx:7](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L7)

## Properties

### config

> **config**: [`SwimlaneConfig`](SwimlaneConfig.md)

Defined in: [src/components/Kanban/Swimlane.tsx:9](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L9)

***

### isLoading?

> `optional` **isLoading?**: `boolean`

Defined in: [src/components/Kanban/Swimlane.tsx:11](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L11)

***

### jobs

> **jobs**: [`Job`](Job-1.md)[]

Defined in: [src/components/Kanban/Swimlane.tsx:10](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L10)

***

### onJobClick?

> `optional` **onJobClick?**: (`job`) => `void`

Defined in: [src/components/Kanban/Swimlane.tsx:13](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L13)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### onJobDrop?

> `optional` **onJobDrop?**: (`jobId`, `targetStage`) => `void`

Defined in: [src/components/Kanban/Swimlane.tsx:12](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L12)

#### Parameters

##### jobId

`string`

##### targetStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`void`

***

### stage

> **stage**: [`JobStage`](../type-aliases/JobStage-1.md)

Defined in: [src/components/Kanban/Swimlane.tsx:8](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/Swimlane.tsx#L8)
