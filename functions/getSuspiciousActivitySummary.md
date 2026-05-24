[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getSuspiciousActivitySummary

# Function: getSuspiciousActivitySummary()

> **getSuspiciousActivitySummary**(`email`): `Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>

Defined in: [src/lib/security/threatDetection.ts:278](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/security/threatDetection.ts#L278)

Get suspicious activity summary for a user

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>
