[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / generateEmailTemplate

# Function: generateEmailTemplate()

> **generateEmailTemplate**(`input`): `Promise`\<\{ `body`: `string`; `subject`: `string`; \}\>

Defined in: [src/lib/document/generator.ts:191](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/document/generator.ts#L191)

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
