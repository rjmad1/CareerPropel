[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ScrapingQueue

# Class: ScrapingQueue

Defined in: [src/lib/scraping/scrapingQueue.ts:36](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L36)

## Constructors

### Constructor

> **new ScrapingQueue**(): `ScrapingQueue`

#### Returns

`ScrapingQueue`

## Methods

### complete()

> **complete**(`executionId`, `userId`, `agentType`, `result`): `Promise`\<`void`\>

Defined in: [src/lib/scraping/scrapingQueue.ts:160](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L160)

Mark a scraping job as successfully completed.

#### Parameters

##### executionId

`string`

##### userId

`string`

##### agentType

[`ExtendedAgentType`](../type-aliases/ExtendedAgentType.md)

##### result

`any`

#### Returns

`Promise`\<`void`\>

***

### dequeueNext()

> **dequeueNext**(): `Promise`\<[`ScrapingJobPayload`](../interfaces/ScrapingJobPayload.md) \| `null`\>

Defined in: [src/lib/scraping/scrapingQueue.ts:132](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L132)

Dequeue the next task in the queue, checking for tripped circuit breakers.

#### Returns

`Promise`\<[`ScrapingJobPayload`](../interfaces/ScrapingJobPayload.md) \| `null`\>

***

### enqueueJobSearch()

> **enqueueJobSearch**(`userId`, `provider`, `query`, `location?`, `limit?`, `correlationId?`): `Promise`\<`string`\>

Defined in: [src/lib/scraping/scrapingQueue.ts:84](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L84)

Enqueue a job search.

#### Parameters

##### userId

`string`

##### provider

`"linkedin"` \| `"indeed"`

##### query

`string`

##### location?

`string`

##### limit?

`number`

##### correlationId?

`string`

#### Returns

`Promise`\<`string`\>

***

### enqueueProfileImport()

> **enqueueProfileImport**(`userId`, `profileUrl`, `correlationId?`): `Promise`\<`string`\>

Defined in: [src/lib/scraping/scrapingQueue.ts:40](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L40)

Enqueue a LinkedIn profile import job.

#### Parameters

##### userId

`string`

##### profileUrl

`string`

##### correlationId?

`string`

#### Returns

`Promise`\<`string`\>

***

### fail()

> **fail**(`job`, `error`): `Promise`\<`void`\>

Defined in: [src/lib/scraping/scrapingQueue.ts:184](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/scraping/scrapingQueue.ts#L184)

Handle job failures, supporting retries, dead-letters, and circuit breakers.

#### Parameters

##### job

[`ScrapingJobPayload`](../interfaces/ScrapingJobPayload.md)

##### error

`string`

#### Returns

`Promise`\<`void`\>
