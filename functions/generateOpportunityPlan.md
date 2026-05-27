[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / generateOpportunityPlan

# Function: generateOpportunityPlan()

> **generateOpportunityPlan**(`jobId`, `candidateId`): `Promise`\<[`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md)\>

Defined in: [src/lib/workflow/opportunity-planner.ts:161](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/workflow/opportunity-planner.ts#L161)

Generate (or refresh) an opportunity execution plan for a job.
Persists the result to OpportunityPlan for retrieval.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md)\>
