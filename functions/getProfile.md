[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getProfile

# Function: getProfile()

> **getProfile**(`userId`): `Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`\>

Defined in: [src/lib/db/profile.ts:9](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/db/profile.ts#L9)

Get user profile

## Parameters

### userId

`string`

## Returns

`Promise`\<\{ `avatarUrl`: `string` \| `null`; `createdAt`: `Date`; `email`: `string`; `emailVerificationToken`: `string` \| `null`; `emailVerificationTokenExp`: `Date` \| `null`; `emailVerified`: `boolean`; `id`: `string`; `location`: `string` \| `null`; `name`: `string`; `passwordHash`: `string` \| `null`; `passwordResetToken`: `string` \| `null`; `passwordResetTokenExp`: `Date` \| `null`; `phone`: `string` \| `null`; `preferences`: `JsonValue`; `summary`: `string` \| `null`; `updatedAt`: `Date`; \} \| `null`\>
