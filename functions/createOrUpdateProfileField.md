[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createOrUpdateProfileField

# Function: createOrUpdateProfileField()

> **createOrUpdateProfileField**(`userId`, `fieldType`, `content`): `Promise`\<\{ `candidateId`: `string`; `content`: `JsonValue`; `createdAt`: `Date`; `id`: `string`; `type`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:39](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/db/profile.ts#L39)

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
