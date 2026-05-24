[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addSkill

# Function: addSkill()

> **addSkill**(`userId`, `name`, `proficiency?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `id`: `string`; `name`: `string`; `proficiency`: `SkillProficiency`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:78](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/db/profile.ts#L78)

Add skill to profile

## Parameters

### userId

`string`

### name

`string`

### proficiency?

`SkillProficiency` = `'intermediate'`

## Returns

`Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `id`: `string`; `name`: `string`; `proficiency`: `SkillProficiency`; `updatedAt`: `Date`; \}\>
