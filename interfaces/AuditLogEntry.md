[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / AuditLogEntry

# Interface: AuditLogEntry

Defined in: [src/lib/logging/auditLog.ts:44](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L44)

## Properties

### action

> **action**: [`AuditAction`](../enumerations/AuditAction.md)

Defined in: [src/lib/logging/auditLog.ts:45](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L45)

***

### details?

> `optional` **details?**: `Record`\<`string`, `any`\>

Defined in: [src/lib/logging/auditLog.ts:49](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L49)

***

### email

> **email**: `string`

Defined in: [src/lib/logging/auditLog.ts:46](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L46)

***

### ipAddress?

> `optional` **ipAddress?**: `string`

Defined in: [src/lib/logging/auditLog.ts:50](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L50)

***

### resource?

> `optional` **resource?**: `string`

Defined in: [src/lib/logging/auditLog.ts:47](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L47)

***

### resourceId?

> `optional` **resourceId?**: `string`

Defined in: [src/lib/logging/auditLog.ts:48](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L48)

***

### severity?

> `optional` **severity?**: `"info"` \| `"error"` \| `"warning"` \| `"critical"`

Defined in: [src/lib/logging/auditLog.ts:53](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L53)

***

### status

> **status**: `"success"` \| `"failure"`

Defined in: [src/lib/logging/auditLog.ts:52](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L52)

***

### userAgent?

> `optional` **userAgent?**: `string`

Defined in: [src/lib/logging/auditLog.ts:51](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/logging/auditLog.ts#L51)
