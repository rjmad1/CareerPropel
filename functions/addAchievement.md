[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / addAchievement

# Function: addAchievement()

> **addAchievement**(`userId`, `title`, `description`, `metrics?`): `Promise`\<\{ `candidateId`: `string`; `createdAt`: `Date`; `description`: `string`; `id`: `string`; `metrics`: `JsonValue`; `title`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:101](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/db/profile.ts#L101)

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
