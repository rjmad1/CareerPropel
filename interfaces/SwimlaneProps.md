[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / SwimlaneProps

# Interface: SwimlaneProps

Defined in: [src/components/Kanban/Swimlane.tsx:16](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L16)

## Properties

### config

> **config**: [`SwimlaneConfig`](SwimlaneConfig.md)

Defined in: [src/components/Kanban/Swimlane.tsx:18](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L18)

***

### isLoading?

> `optional` **isLoading?**: `boolean`

Defined in: [src/components/Kanban/Swimlane.tsx:20](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L20)

***

### jobs

> **jobs**: [`Job`](Job-1.md)[]

Defined in: [src/components/Kanban/Swimlane.tsx:19](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L19)

***

### onJobClick?

> `optional` **onJobClick?**: (`job`) => `void`

Defined in: [src/components/Kanban/Swimlane.tsx:22](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L22)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### onJobDrop?

> `optional` **onJobDrop?**: (`jobId`, `targetStage`) => `void`

Defined in: [src/components/Kanban/Swimlane.tsx:21](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L21)

#### Parameters

##### jobId

`string`

##### targetStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`void`

***

### onJobMoveStage?

> `optional` **onJobMoveStage?**: (`jobId`, `targetStage`) => `void`

Defined in: [src/components/Kanban/Swimlane.tsx:23](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L23)

#### Parameters

##### jobId

`string`

##### targetStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`void`

***

### renderJobCard?

> `optional` **renderJobCard?**: (`job`, `handlers`) => `ReactNode`

Defined in: [src/components/Kanban/Swimlane.tsx:27](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L27)

Optional custom renderer — replaces the default JobCard when provided.
 Receives the job plus all handlers so consumers can wrap/enhance JobCard
 without reimplementing drag-and-drop or click logic.

#### Parameters

##### job

[`Job`](Job-1.md)

##### handlers

###### draggableProps?

`Record`\<`string`, `unknown`\>

###### isDragging?

`boolean`

###### onClick

(`job`) => `void`

###### onDragEnd

(`e`) => `void`

###### onDragOver?

(`e`) => `void`

###### onDragStart

(`e`) => `void`

#### Returns

`ReactNode`

***

### stage

> **stage**: [`JobStage`](../type-aliases/JobStage-1.md)

Defined in: [src/components/Kanban/Swimlane.tsx:17](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/Swimlane.tsx#L17)
