[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logSecurityEvent

# Function: logSecurityEvent()

> **logSecurityEvent**(`action`, `email`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/logging/auditLog.ts:84](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/logging/auditLog.ts#L84)

## Parameters

### action

[`AuditAction`](../enumerations/AuditAction.md)

### email

`string`

### options?

#### changes?

`Record`\<`string`, `any`\>

#### errorMessage?

`string`

#### ipAddress?

`string`

#### resourceId?

`string`

#### resourceType?

`string`

#### status?

`"SUCCESS"` \| `"FAILURE"`

#### userAgent?

`string`

## Returns

`Promise`\<`void`\>
