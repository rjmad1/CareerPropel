[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addAchievement

# Function: addAchievement()

> **addAchievement**(`userId`, `title`, `description`, `metrics?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:109](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/db/profile.ts#L109)

Add achievement to profile

## Parameters

### userId

`string`

### title

`string`

### description

`string`

### metrics?

`Record`\<`string`, `any`\>

## Returns

`Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>
