[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / generateEmailTemplate

# Function: generateEmailTemplate()

> **generateEmailTemplate**(`input`): `Promise`\<\{ `body`: `string`; `subject`: `string`; \}\>

Defined in: [src/lib/document/generator.ts:191](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/generator.ts#L191)

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
