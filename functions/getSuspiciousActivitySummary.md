[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / getSuspiciousActivitySummary

# Function: getSuspiciousActivitySummary()

> **getSuspiciousActivitySummary**(`email`): `Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>

Defined in: [src/lib/security/threatDetection.ts:278](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/security/threatDetection.ts#L278)

Get suspicious activity summary for a user

## Parameters

### email

`string`

## Returns

`Promise`\<\{ `alerts`: [`ThreatAlert`](../interfaces/ThreatAlert.md)[]; `riskScore`: `number`; \}\>
