[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / JobCard

# Variable: JobCard

> `const` **JobCard**: `React.FC`\<[`JobCardProps`](../interfaces/JobCardProps.md)\>

Defined in: [src/components/Kanban/JobCard.tsx:43](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/components/Kanban/JobCard.tsx#L43)

JobCard - Individual job application card in the Kanban board

Features:
- Real-time updates via WebSocket
- Drag-and-drop support
- Match score indicator
- Priority level visualization
- Interview status badge
- Confidence indicator
- Quick action hints
- Risks/blockers display

Displays:
- Role name
- Company name
- Match score (0-100%)
- Interview status
- Priority badge
- Confidence indicator
- Risk/blocker indicators
- Next action preview

Props:
- job: Job data object
- onClick?: Callback when card is clicked
- onDragStart?: Callback for drag start
- isDraggedOver?: Visual indication if dragged over
