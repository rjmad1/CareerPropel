[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobCardProps

# Interface: JobCardProps

Defined in: [src/components/Kanban/JobCard.tsx:7](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L7)

## Properties

### isDraggedOver?

> `optional` **isDraggedOver?**: `boolean`

Defined in: [src/components/Kanban/JobCard.tsx:11](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L11)

***

### job

> **job**: [`Job`](Job-1.md)

Defined in: [src/components/Kanban/JobCard.tsx:8](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L8)

***

### onClick?

> `optional` **onClick?**: () => `void`

Defined in: [src/components/Kanban/JobCard.tsx:9](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L9)

#### Returns

`void`

***

### onDragStart?

> `optional` **onDragStart?**: (`e`) => `void`

Defined in: [src/components/Kanban/JobCard.tsx:10](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L10)

#### Parameters

##### e

`DragEvent`\<`HTMLDivElement`\>

#### Returns

`void`

***

### onMoveStage?

> `optional` **onMoveStage?**: (`jobId`, `targetStage`) => `void`

Defined in: [src/components/Kanban/JobCard.tsx:12](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/JobCard.tsx#L12)

#### Parameters

##### jobId

`string`

##### targetStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`void`
