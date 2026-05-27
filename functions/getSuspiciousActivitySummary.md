[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getSuspiciousActivitySummary

# Function: getSuspiciousActivitySummary()

> **getSuspiciousActivitySummary**(`email`): `Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>

Defined in: [src/lib/security/threatDetection.ts:278](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/security/threatDetection.ts#L278)

Get suspicious activity summary for a user

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>
