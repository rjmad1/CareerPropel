[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ScrapingProvider

# Interface: ScrapingProvider

Defined in: [src/lib/scraping/provider.ts:42](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/provider.ts#L42)

## Methods

### importProfile()?

> `optional` **importProfile**(`profileUrl`): `Promise`\<[`ImportedProfile`](ImportedProfile.md)\>

Defined in: [src/lib/scraping/provider.ts:44](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/provider.ts#L44)

#### Parameters

##### profileUrl

`string`

#### Returns

`Promise`\<[`ImportedProfile`](ImportedProfile.md)\>

***

### searchJobs()

> **searchJobs**(`query`, `location?`, `limit?`): `Promise`\<[`ImportedJob`](ImportedJob.md)[]\>

Defined in: [src/lib/scraping/provider.ts:43](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/provider.ts#L43)

#### Parameters

##### query

`string`

##### location?

`string`

##### limit?

`number`

#### Returns

`Promise`\<[`ImportedJob`](ImportedJob.md)[]\>
