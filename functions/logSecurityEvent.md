[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logSecurityEvent

# Function: logSecurityEvent()

> **logSecurityEvent**(`action`, `email`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/logging/auditLog.ts:84](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/logging/auditLog.ts#L84)

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
