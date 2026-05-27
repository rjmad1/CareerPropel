[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / Swimlane

# Variable: Swimlane

> `const` **Swimlane**: `React.FC`\<[`SwimlaneProps`](../interfaces/SwimlaneProps.md)\>

Defined in: [src/components/Kanban/Swimlane.tsx:34](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/components/Kanban/Swimlane.tsx#L34)

Swimlane - A vertical column representing one job application stage

Features:
- Displays all jobs in a specific stage
- Drag-and-drop support for moving jobs between stages
- Real-time updates from WebSocket
- Visual indicators (count, stage icon, color)
- Scrollable job list

Props:
- stage: The job stage this swimlane represents
- config: Visual configuration (color, icon, label)
- jobs: Array of jobs in this stage
- isLoading?: Whether data is loading
- onJobDrop?: Callback when job is dropped on this swimlane
- onJobClick?: Callback when job card is clicked
