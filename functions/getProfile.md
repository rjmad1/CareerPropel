[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getProfile

# Function: getProfile()

> **getProfile**(`userId`): `Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`\>

Defined in: [src/lib/db/profile.ts:7](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/db/profile.ts#L7)

Get user profile

## Parameters

### userId

`string`

## Returns

`Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`\>
