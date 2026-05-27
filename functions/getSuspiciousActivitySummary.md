[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getSuspiciousActivitySummary

# Function: getSuspiciousActivitySummary()

> **getSuspiciousActivitySummary**(`email`): `Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>

Defined in: [src/lib/security/threatDetection.ts:278](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/security/threatDetection.ts#L278)

Get suspicious activity summary for a user

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>
