[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ValidationCritic

# Class: ValidationCritic

Defined in: [src/lib/orchestration/critic.ts:14](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/critic.ts#L14)

## Constructors

### Constructor

> **new ValidationCritic**(): `ValidationCritic`

#### Returns

`ValidationCritic`

## Methods

### auditStepOutput()

> `static` **auditStepOutput**(`stepKey`, `agentType`, `output`, `userId`): `Promise`\<[`CriticResult`](../interfaces/CriticResult-1.md)\>

Defined in: [src/lib/orchestration/critic.ts:18](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/orchestration/critic.ts#L18)

Audits specialized agent output against active governance schemas and safety rules.

#### Parameters

##### stepKey

`string`

##### agentType

`string`

##### output

`Record`\<`string`, `unknown`\>

##### userId

`string`

#### Returns

`Promise`\<[`CriticResult`](../interfaces/CriticResult-1.md)\>
