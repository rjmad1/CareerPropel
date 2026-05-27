[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / generateEmailTemplate

# Function: generateEmailTemplate()

> **generateEmailTemplate**(`input`): `Promise`\<\{ `body`: `string`; `subject`: `string`; \}\>

Defined in: [src/lib/document/generator.ts:191](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/document/generator.ts#L191)

## Parameters

### input

#### candidateName?

`string`

#### company?

`string`

#### context?

`string`

#### daysSinceInterview?

`number`

#### interviewerName?

`string`

#### jobTitle?

`string`

#### offerAmount?

`number`

#### reason?

`string`

#### targetAmount?

`number`

#### type

`"follow_up"` \| `"thank_you"` \| `"counter_offer"` \| `"withdraw"` \| `"recruiter_reach_out"`

## Returns

`Promise`\<\{ `body`: `string`; `subject`: `string`; \}\>
