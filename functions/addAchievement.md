[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addAchievement

# Function: addAchievement()

> **addAchievement**(`userId`, `title`, `description`, `metrics?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:109](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/db/profile.ts#L109)

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
