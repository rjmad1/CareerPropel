[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ScrapingProvider

# Interface: ScrapingProvider

Defined in: [src/lib/scraping/provider.ts:42](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/scraping/provider.ts#L42)

## Methods

### importProfile()?

> `optional` **importProfile**(`profileUrl`): `Promise`\<[`ImportedProfile`](ImportedProfile.md)\>

Defined in: [src/lib/scraping/provider.ts:44](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/scraping/provider.ts#L44)

#### Parameters

##### profileUrl

`string`

#### Returns

`Promise`\<[`ImportedProfile`](ImportedProfile.md)\>

***

### searchJobs()

> **searchJobs**(`query`, `location?`, `limit?`): `Promise`\<[`ImportedJob`](ImportedJob.md)[]\>

Defined in: [src/lib/scraping/provider.ts:43](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/scraping/provider.ts#L43)

#### Parameters

##### query

`string`

##### location?

`string`

##### limit?

`number`

#### Returns

`Promise`\<[`ImportedJob`](ImportedJob.md)[]\>
