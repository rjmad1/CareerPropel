[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / TelemetryApiClient

# Class: TelemetryApiClient

Defined in: [src/observability-platform/packages/api-client/client.ts:15](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L15)

## Constructors

### Constructor

> **new TelemetryApiClient**(): `TelemetryApiClient`

Defined in: [src/observability-platform/packages/api-client/client.ts:20](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L20)

#### Returns

`TelemetryApiClient`

## Methods

### getAgentMetrics()

> **getAgentMetrics**(): `Promise`\<[`AgentMetric`](../interfaces/AgentMetric.md)[]\>

Defined in: [src/observability-platform/packages/api-client/client.ts:175](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L175)

#### Returns

`Promise`\<[`AgentMetric`](../interfaces/AgentMetric.md)[]\>

***

### getAuditLogs()

> **getAuditLogs**(): `Promise`\<[`AuditLog`](../interfaces/AuditLog.md)[]\>

Defined in: [src/observability-platform/packages/api-client/client.ts:205](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L205)

#### Returns

`Promise`\<[`AuditLog`](../interfaces/AuditLog.md)[]\>

***

### getTraceDetails()

> **getTraceDetails**(`traceId`): `Promise`\<\{ `spans`: [`Span`](../interfaces/Span.md)[]; `trace`: [`Trace`](../interfaces/Trace.md); \} \| `null`\>

Defined in: [src/observability-platform/packages/api-client/client.ts:139](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L139)

#### Parameters

##### traceId

`string`

#### Returns

`Promise`\<\{ `spans`: [`Span`](../interfaces/Span.md)[]; `trace`: [`Trace`](../interfaces/Trace.md); \} \| `null`\>

***

### getTraces()

> **getTraces**(`filters?`): `Promise`\<[`Trace`](../interfaces/Trace.md)[]\>

Defined in: [src/observability-platform/packages/api-client/client.ts:128](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L128)

#### Parameters

##### filters?

###### environment?

`string`

###### projectName?

`string`

###### status?

`string`

#### Returns

`Promise`\<[`Trace`](../interfaces/Trace.md)[]\>

***

### getWorkflowGraph()

> **getWorkflowGraph**(`traceId`): `Promise`\<[`WorkflowDAG`](../interfaces/WorkflowDAG.md)\>

Defined in: [src/observability-platform/packages/api-client/client.ts:148](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L148)

#### Parameters

##### traceId

`string`

#### Returns

`Promise`\<[`WorkflowDAG`](../interfaces/WorkflowDAG.md)\>

***

### subscribeToRealTimeEvents()

> **subscribeToRealTimeEvents**(`callback`): () => `void`

Defined in: [src/observability-platform/packages/api-client/client.ts:227](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/observability-platform/packages/api-client/client.ts#L227)

#### Parameters

##### callback

(`event`) => `void`

#### Returns

() => `void`
