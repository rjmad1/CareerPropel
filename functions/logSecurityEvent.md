[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logSecurityEvent

# Function: logSecurityEvent()

> **logSecurityEvent**(`action`, `email`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/logging/auditLog.ts:84](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/logging/auditLog.ts#L84)

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
