[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / saveProfileEntity

# Function: saveProfileEntity()

> **saveProfileEntity**(`candidateId`, `entity`): `Promise`\<[`ProfileEntity`](../interfaces/ProfileEntity.md)\>

Defined in: [src/lib/profile/profileService.ts:111](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/profile/profileService.ts#L111)

Create or update a profile entity

## Parameters

### candidateId

`string`

### entity

`Omit`\<[`ProfileEntity`](../interfaces/ProfileEntity.md), `"createdAt"` \| `"updatedAt"`\>

## Returns

`Promise`\<[`ProfileEntity`](../interfaces/ProfileEntity.md)\>
