[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addAchievement

# Function: addAchievement()

> **addAchievement**(`userId`, `title`, `description`, `metrics?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:101](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/db/profile.ts#L101)

Add achievement to profile

## Parameters

### userId

`string`

### title

`string`

### description

`string`

### metrics?

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>
