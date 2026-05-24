[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addSkill

# Function: addSkill()

> **addSkill**(`userId`, `name`, `proficiency?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `id`: `string`; `name`: `string`; `proficiency`: `SkillProficiency`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:78](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/db/profile.ts#L78)

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
