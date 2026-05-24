[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createOrUpdateProfileField

# Function: createOrUpdateProfileField()

> **createOrUpdateProfileField**(`userId`, `fieldType`, `content`): `Promise`\<\{ `candidateId`: `string`; `content`: `JsonValue`; `createdAt`: `Date`; `id`: `string`; `type`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:39](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/db/profile.ts#L39)

Create or update profile field

## Parameters

### userId

`string`

### fieldType

`string`

### content

`Record`\<`string`, `unknown`\>

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `JsonValue`; `createdAt`: `Date`; `id`: `string`; `type`: `string`; `updatedAt`: `Date`; \}\>
