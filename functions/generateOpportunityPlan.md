[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / generateOpportunityPlan

# Function: generateOpportunityPlan()

> **generateOpportunityPlan**(`jobId`, `candidateId`): `Promise`\<[`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md)\>

Defined in: [src/lib/workflow/opportunity-planner.ts:161](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/opportunity-planner.ts#L161)

Generate (or refresh) an opportunity execution plan for a job.
Persists the result to OpportunityPlan for retrieval.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`OpportunityPlanResult`](../interfaces/OpportunityPlanResult.md)\>
