[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / createOrUpdateProfileField

# Function: createOrUpdateProfileField()

> **createOrUpdateProfileField**(`userId`, `fieldType`, `content`): `Promise`\<\{ `candidateId`: `string`; `content`: `JsonValue`; `createdAt`: `Date`; `id`: `string`; `type`: `string`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:37](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/db/profile.ts#L37)

Create or update profile field

## Parameters

### userId

`string`

### fieldType

`string`

### content

`Record`\<`string`, `any`\>

## Returns

`Promise`\<\{ `candidateId`: `string`; `content`: `JsonValue`; `createdAt`: `Date`; `id`: `string`; `type`: `string`; `updatedAt`: `Date`; \}\>
