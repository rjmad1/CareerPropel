[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLinkedInJobs

# Function: searchLinkedInJobs()

> **searchLinkedInJobs**(`keywords`, `location?`, `limit?`): `Promise`\<[`LinkedInJob`](../interfaces/LinkedInJob.md)[]\>

Defined in: [src/lib/scraping/linkedin.ts:94](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/scraping/linkedin.ts#L94)

Search LinkedIn public job listings.

## Parameters

### keywords

`string`

### location?

`string` = `'United States'`

### limit?

`number` = `20`

## Returns

`Promise`\<[`LinkedInJob`](../interfaces/LinkedInJob.md)[]\>
