[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildOpportunityHealthInput

# Function: buildOpportunityHealthInput()

> **buildOpportunityHealthInput**(`jobId`, `candidateId`): `Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>

Defined in: [src/lib/workflow/health-input-builder.ts:8](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/workflow/health-input-builder.ts#L8)

Fetch job + related counts and assemble an OpportunityHealthInput ready for scoreOpportunityHealth.
Returns null when the job does not exist or does not belong to candidateId.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>
