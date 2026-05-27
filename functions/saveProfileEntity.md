[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / saveProfileEntity

# Function: saveProfileEntity()

> **saveProfileEntity**(`candidateId`, `entity`): `Promise`\<[`ProfileEntity`](../interfaces/ProfileEntity.md)\>

Defined in: [src/lib/profile/profileService.ts:111](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/profile/profileService.ts#L111)

Create or update a profile entity

## Parameters

### candidateId

`string`

### entity

`Omit`\<[`ProfileEntity`](../interfaces/ProfileEntity.md), `"createdAt"` \| `"updatedAt"`\>

## Returns

`Promise`\<[`ProfileEntity`](../interfaces/ProfileEntity.md)\>
