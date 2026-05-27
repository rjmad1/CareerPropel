[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / KanbanBoardProps

# Interface: KanbanBoardProps

Defined in: [src/components/Kanban/KanbanBoard.tsx:10](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L10)

## Properties

### initialJobs?

> `optional` **initialJobs?**: [`Job`](Job-1.md)[]

Defined in: [src/components/Kanban/KanbanBoard.tsx:11](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L11)

***

### onJobClick?

> `optional` **onJobClick?**: (`job`) => `void`

Defined in: [src/components/Kanban/KanbanBoard.tsx:14](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L14)

#### Parameters

##### job

[`Job`](Job-1.md)

#### Returns

`void`

***

### onJobMove?

> `optional` **onJobMove?**: (`jobId`, `newStage`) => `void` \| `Promise`\<[`MoveResult`](MoveResult.md)\>

Defined in: [src/components/Kanban/KanbanBoard.tsx:13](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L13)

#### Parameters

##### jobId

`string`

##### newStage

`string`

#### Returns

`void` \| `Promise`\<[`MoveResult`](MoveResult.md)\>

***

### onJobSelect?

> `optional` **onJobSelect?**: (`id`) => `void`

Defined in: [src/components/Kanban/KanbanBoard.tsx:16](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L16)

#### Parameters

##### id

`string` \| `null`

#### Returns

`void`

***

### onJobUpdate?

> `optional` **onJobUpdate?**: (`jobId`, `updates`) => `Promise`\<`void`\>

Defined in: [src/components/Kanban/KanbanBoard.tsx:12](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L12)

#### Parameters

##### jobId

`string`

##### updates

`Partial`\<[`Job`](Job-1.md)\>

#### Returns

`Promise`\<`void`\>

***

### selectedJobId?

> `optional` **selectedJobId?**: `string` \| `null`

Defined in: [src/components/Kanban/KanbanBoard.tsx:15](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/KanbanBoard.tsx#L15)
