[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / POST

# Function: POST()

> **POST**(`_request`, `context`): `Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `attempts`: `number`; `completedAt`: `Date` \| `null`; `correlationId`: `string` \| `null`; `costUsd`: `number` \| `null`; `createdAt`: `Date`; `currentTask`: `string` \| `null`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `fallbackReason`: `string` \| `null`; `fallbackUsed`: `boolean`; `id`: `string`; `input`: `string` \| `null`; `inputTokens`: `number` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `metadata`: `JsonValue`; `model`: `string` \| `null`; `modelId`: `string` \| `null`; `output`: `string` \| `null`; `outputTokens`: `number` \| `null`; `policyValidated`: `boolean` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `progress`: `number`; `promptHash`: `string` \| `null`; `promptVersionId`: `string` \| `null`; `provider`: `string` \| `null`; `providerId`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `queueJobId`: `string` \| `null`; `railwayServiceId`: `string` \| `null`; `requestId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `sanitizerVersion`: `string` \| `null`; `schemaValidated`: `boolean` \| `null`; `semanticValidated`: `boolean` \| `null`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `validationErrors`: `JsonValue`; `validationPassed`: `boolean` \| `null`; `validationVersion`: `string` \| `null`; `workerId`: `string` \| `null`; \}; `message`: `string`; \}\>\>

Defined in: [src/app/api/agent/execution/\[executionId\]/pause/route.ts:11](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/app/api/agent/execution/[executionId]/pause/route.ts#L11)

POST /api/agent/execution/[executionId]/pause
Pause a running execution

## Parameters

### \_request

`NextRequest`

### context

#### params

`Promise`\<\{ `executionId`: `string`; \}\>

## Returns

`Promise`\<`NextResponse`\<\{ `error`: `string`; \}\> \| `NextResponse`\<\{ `execution`: \{ `actualCost`: `number` \| `null`; `agentType`: `string`; `attempts`: `number`; `completedAt`: `Date` \| `null`; `correlationId`: `string` \| `null`; `costUsd`: `number` \| `null`; `createdAt`: `Date`; `currentTask`: `string` \| `null`; `deploymentEnvironment`: `DeploymentEnvironment` \| `null`; `deploymentSha`: `string` \| `null`; `deploymentTimestamp`: `Date` \| `null`; `deploymentVersion`: `string` \| `null`; `durationMs`: `number` \| `null`; `errorMessage`: `string` \| `null`; `estimatedCost`: `number` \| `null`; `executionSource`: `ExecutionSource` \| `null`; `failureClassification`: `FailureClassification` \| `null`; `fallbackReason`: `string` \| `null`; `fallbackUsed`: `boolean`; `id`: `string`; `input`: `string` \| `null`; `inputTokens`: `number` \| `null`; `interruptedAt`: `Date` \| `null`; `interruptionReason`: `InterruptionReason` \| `null`; `jobId`: `string` \| `null`; `latencyMs`: `number` \| `null`; `metadata`: `JsonValue`; `model`: `string` \| `null`; `modelId`: `string` \| `null`; `output`: `string` \| `null`; `outputTokens`: `number` \| `null`; `policyValidated`: `boolean` \| `null`; `previousDeploymentVersion`: `string` \| `null`; `progress`: `number`; `promptHash`: `string` \| `null`; `promptVersionId`: `string` \| `null`; `provider`: `string` \| `null`; `providerId`: `string` \| `null`; `queuedAt`: `Date` \| `null`; `queueJobId`: `string` \| `null`; `railwayServiceId`: `string` \| `null`; `requestId`: `string` \| `null`; `retryCount`: `number`; `retryLineage`: `JsonValue`; `sanitizerVersion`: `string` \| `null`; `schemaValidated`: `boolean` \| `null`; `semanticValidated`: `boolean` \| `null`; `startedAt`: `Date` \| `null`; `status`: `AgentExecutionStatus`; `tokenCount`: `number` \| `null`; `tokenUsage`: `JsonValue`; `updatedAt`: `Date`; `userId`: `string`; `validationErrors`: `JsonValue`; `validationPassed`: `boolean` \| `null`; `validationVersion`: `string` \| `null`; `workerId`: `string` \| `null`; \}; `message`: `string`; \}\>\>
