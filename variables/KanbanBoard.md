[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / KanbanBoard

# Variable: KanbanBoard

> `const` **KanbanBoard**: `React.FC`\<[`KanbanBoardProps`](../interfaces/KanbanBoardProps.md)\>

Defined in: [src/components/Kanban/KanbanBoard.tsx:45](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/components/Kanban/KanbanBoard.tsx#L45)

KanbanBoard - Main Kanban/swimlane view of job applications

Features:
- Real-time job updates via WebSocket
- Drag-and-drop between swimlanes
- Optimistic updates for smooth UX
- Animated transitions
- Stage-based organization
- Swimlane statistics

Layout:
- Horizontal scroll container with swimlanes
- Each swimlane represents a job application stage
- Jobs flow left-to-right through pipeline

WebSocket subscriptions:
- 'job:update' - Real-time job changes
- 'job:created' - New jobs added
- 'job:deleted' - Jobs removed

Props:
- initialJobs?: Initial job data
- onJobUpdate?: Callback to persist job changes
- onJobClick?: Callback when job card clicked
