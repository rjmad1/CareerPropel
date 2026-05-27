[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildOpportunityHealthInput

# Function: buildOpportunityHealthInput()

> **buildOpportunityHealthInput**(`jobId`, `candidateId`): `Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>

Defined in: [src/lib/workflow/health-input-builder.ts:8](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/workflow/health-input-builder.ts#L8)

Fetch job + related counts and assemble an OpportunityHealthInput ready for scoreOpportunityHealth.
Returns null when the job does not exist or does not belong to candidateId.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>
