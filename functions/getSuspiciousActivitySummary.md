[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getSuspiciousActivitySummary

# Function: getSuspiciousActivitySummary()

> **getSuspiciousActivitySummary**(`email`): `Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>

Defined in: [src/lib/security/threatDetection.ts:278](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/security/threatDetection.ts#L278)

Get suspicious activity summary for a user

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>
