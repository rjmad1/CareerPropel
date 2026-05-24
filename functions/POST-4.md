[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `id`: `string`; `input`: `string` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `model`: `string` \| `null`; `output`: `string` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `provider`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `railwayServiceId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `workerId`: `string` \| `null`; \}; `message`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/resume/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/app/api/agent/execution/[executionId]/resume/route.ts#L11)

POST /api/agent/execution/[executionId]/resume
Resume a paused execution

## Parameters

### \_request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `completedAt`: `Date` \| `null`; `createdAt`: `Date`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `id`: `string`; `input`: `string` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `model`: `string` \| `null`; `output`: `string` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `provider`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `railwayServiceId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `workerId`: `string` \| `null`; \}; `message`: `string`; \}\>\>
