[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / APIClient

# Class: APIClient

Defined in: [src/lib/api/client.ts:29](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L29)

## Constructors

### Constructor

> **new APIClient**(`baseURL?`): `APIClient`

Defined in: [src/lib/api/client.ts:32](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L32)

#### Parameters

##### baseURL?

`string` = `'/api'`

#### Returns

`APIClient`

## Methods

### createJob()

> **createJob**(`job`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:134](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L134)

#### Parameters

##### job

`any`

#### Returns

`Promise`\<`any`\>

***

### deleteJob()

> **deleteJob**(`id`): `Promise`\<`void`\>

Defined in: [src/lib/api/client.ts:142](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L142)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

***

### getAgentLogs()

> **getAgentLogs**(`agentId`): `Promise`\<`string`[]\>

Defined in: [src/lib/api/client.ts:155](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L155)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<`string`[]\>

***

### getAgents()

> **getAgents**(): `Promise`\<`any`[]\>

Defined in: [src/lib/api/client.ts:151](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L151)

#### Returns

`Promise`\<`any`[]\>

***

### getDocuments()

> **getDocuments**(): `Promise`\<`any`[]\>

Defined in: [src/lib/api/client.ts:180](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L180)

#### Returns

`Promise`\<`any`[]\>

***

### getJobById()

> **getJobById**(`id`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:130](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L130)

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`any`\>

***

### getJobs()

> **getJobs**(`filters?`): `Promise`\<`any`[]\>

Defined in: [src/lib/api/client.ts:126](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L126)

#### Parameters

##### filters?

`Record`\<`string`, `string` \| `number` \| `boolean`\>

#### Returns

`Promise`\<`any`[]\>

***

### getUserProfile()

> **getUserProfile**(): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:164](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L164)

#### Returns

`Promise`\<`any`\>

***

### moveJob()

> **moveJob**(`id`, `stage`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:146](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L146)

#### Parameters

##### id

`string`

##### stage

`string`

#### Returns

`Promise`\<`any`\>

***

### pauseAgent()

> **pauseAgent**(`agentId`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:159](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L159)

#### Parameters

##### agentId

`string`

#### Returns

`Promise`\<`any`\>

***

### request()

> **request**\<`T`\>(`method`, `path`, `options?`): `Promise`\<`T`\>

Defined in: [src/lib/api/client.ts:60](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L60)

#### Type Parameters

##### T

`T`

#### Parameters

##### method

`"POST"` \| `"GET"` \| `"PUT"` \| `"DELETE"` \| `"PATCH"`

##### path

`string`

##### options?

`RequestOptions`

#### Returns

`Promise`\<`T`\>

***

### updateJob()

> **updateJob**(`id`, `updates`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:138](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L138)

#### Parameters

##### id

`string`

##### updates

`any`

#### Returns

`Promise`\<`any`\>

***

### updateProfile()

> **updateProfile**(`updates`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:168](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L168)

#### Parameters

##### updates

`any`

#### Returns

`Promise`\<`any`\>

***

### uploadDocument()

> **uploadDocument**(`file`, `jobId?`): `Promise`\<`any`\>

Defined in: [src/lib/api/client.ts:173](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/api/client.ts#L173)

#### Parameters

##### file

`File`

##### jobId?

`string`

#### Returns

`Promise`\<`any`\>
