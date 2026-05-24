[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / KanbanBoardProps

# Interface: KanbanBoardProps

Defined in: [src/components/Kanban/KanbanBoard.tsx:46](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/KanbanBoard.tsx#L46)

## Properties

### initialJobs?

> `optional` **initialJobs?**: [`Job`](Job-1.md)[]

Defined in: [src/components/Kanban/KanbanBoard.tsx:47](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/KanbanBoard.tsx#L47)

***

### onJobClick?

> `optional` **onJobClick?**: (`job`) => `void`

Defined in: [src/components/Kanban/KanbanBoard.tsx:52](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/KanbanBoard.tsx#L52)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### onJobMove?

> `optional` **onJobMove?**: (`jobId`, `newStage`) => `Promise`\<[`MoveResult`](MoveResult.md)\>

Defined in: [src/components/Kanban/KanbanBoard.tsx:51](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/KanbanBoard.tsx#L51)

Called for stage changes; returns MoveResult with optional executionId

#### Parameters

##### jobId

`string`

##### newStage

[`JobStage`](../type-aliases/JobStage-1.md)

#### Returns

`Promise`\<[`MoveResult`](MoveResult.md)\>

***

### onJobUpdate?

> `optional` **onJobUpdate?**: (`jobId`, `updates`) => `Promise`\<`void`\>

Defined in: [src/components/Kanban/KanbanBoard.tsx:49](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/components/Kanban/KanbanBoard.tsx#L49)

Called for non-stage updates (notes, priority, etc.)

#### Parameters

##### jobId

`string`

##### updates

`Partial`\<[`Job`](Job-1.md)\>

#### Returns

`Promise`\<`void`\>
