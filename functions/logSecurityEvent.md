[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logSecurityEvent

# Function: logSecurityEvent()

> **logSecurityEvent**(`action`, `email`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/logging/auditLog.ts:84](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/logging/auditLog.ts#L84)

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
