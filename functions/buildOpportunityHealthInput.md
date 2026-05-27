[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildOpportunityHealthInput

# Function: buildOpportunityHealthInput()

> **buildOpportunityHealthInput**(`jobId`, `candidateId`): `Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>

Defined in: [src/lib/workflow/health-input-builder.ts:8](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/workflow/health-input-builder.ts#L8)

Fetch job + related counts and assemble an OpportunityHealthInput ready for scoreOpportunityHealth.
Returns null when the job does not exist or does not belong to candidateId.

## Parameters

### jobId

`string`

### candidateId

`string`

## Returns

`Promise`\<[`OpportunityHealthInput`](../interfaces/OpportunityHealthInput.md) \| `null`\>
