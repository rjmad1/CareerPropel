[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / PUT

# Function: PUT()

> **PUT**(`request`, `context`): `Promise`\<`NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `id`: `string`; `input`: `string` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `model`: `string` \| `null`; `output`: `string` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `provider`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `railwayServiceId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `workerId`: `string` \| `null`; \}; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/route.ts:56](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/app/api/agent/execution/[executionId]/route.ts#L56)

PUT /api/agent/execution/[executionId]
Update execution status

## Parameters

### request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `id`: `string`; `input`: `string` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `model`: `string` \| `null`; `output`: `string` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `provider`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `railwayServiceId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `workerId`: `string` \| `null`; \}; \}\> \| `NextResponse`\<\{ `error`: `string`; \}\>\>
