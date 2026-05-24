[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / logSecurityEvent

# Function: logSecurityEvent()

> **logSecurityEvent**(`action`, `email`, `options?`): `Promise`\<`void`\>

Defined in: [src/lib/logging/auditLog.ts:80](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/logging/auditLog.ts#L80)

## Parameters

### action

[`AuditAction`](../enumerations/AuditAction.md)

### email

`string`

### options?

#### details?

`Record`\<`string`, `any`\>

#### ipAddress?

`string`

#### resource?

`string`

#### resourceId?

`string`

#### severity?

`"info"` \| `"error"` \| `"warning"` \| `"critical"`

#### status?

`"success"` \| `"failure"`

#### userAgent?

`string`

## Returns

`Promise`\<`void`\>
