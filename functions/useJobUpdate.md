[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / useJobUpdate

# Function: useJobUpdate()

> **useJobUpdate**(`jobId`): `object`

Defined in: [src/hooks/useSocket.ts:240](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useSocket.ts#L240)

Hook to emit job updates

## Parameters

### jobId

`string`

## Returns

`object`

### updateJob

> **updateJob**: (`updateData`) => `Promise`\<`unknown`\>

#### Parameters

##### updateData

`any`

#### Returns

`Promise`\<`unknown`\>

### updateNotes

> **updateNotes**: (`notes`) => `Promise`\<`unknown`\>

#### Parameters

##### notes

`string`

#### Returns

`Promise`\<`unknown`\>

### updateStage

> **updateStage**: (`newStage`) => `Promise`\<`unknown`\>

#### Parameters

##### newStage

`string`

#### Returns

`Promise`\<`unknown`\>
