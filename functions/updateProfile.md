[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / updateProfile

# Function: updateProfile()

> **updateProfile**(`userId`, `data`): `Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \}\>

Defined in: [src/lib/db/profile.ts:16](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/db/profile.ts#L16)

Update user profile

## Parameters

### userId

`string`

### data

#### email?

`string` = `...`

#### experience?

`object`[] = `...`

#### location?

`string` = `...`

#### name?

`string` = `...`

#### phone?

`string` = `...`

#### preferences?

\{ `jobTypes?`: (`"full_time"` \| `"part_time"` \| `"contract"` \| `"freelance"`)[]; `locations?`: `string`[]; `salaryExpectation?`: `number`; `targetCompanies?`: `string`[]; `targetRoles?`: `string`[]; `workArrangement?`: (`"remote"` \| `"hybrid"` \| `"on_site"`)[]; \} = `...`

#### preferences.jobTypes?

(`"full_time"` \| `"part_time"` \| `"contract"` \| `"freelance"`)[] = `...`

#### preferences.locations?

`string`[] = `...`

#### preferences.salaryExpectation?

`number` = `...`

#### preferences.targetCompanies?

`string`[] = `...`

#### preferences.targetRoles?

`string`[] = `...`

#### preferences.workArrangement?

(`"remote"` \| `"hybrid"` \| `"on_site"`)[] = `...`

#### skills?

`string`[] = `...`

#### summary?

`string` = `...`

## Returns

`Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \}\>
