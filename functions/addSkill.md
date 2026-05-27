[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addSkill

# Function: addSkill()

> **addSkill**(`userId`, `name`, `proficiency?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `id`: `string`; `name`: `string`; `proficiency`: `SkillProficiency`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:86](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/db/profile.ts#L86)

## Parameters

### userId

`string`

### name

`string`

### proficiency?

`string` = `'intermediate'`

## Returns

`Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `id`: `string`; `name`: `string`; `proficiency`: `SkillProficiency`; `updatedAt`: `Date`; \}\>
