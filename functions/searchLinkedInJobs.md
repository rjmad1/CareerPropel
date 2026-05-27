[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLinkedInJobs

# Function: searchLinkedInJobs()

> **searchLinkedInJobs**(`keywords`, `location?`, `limit?`): `Promise`\<[`LinkedInJob`](../interfaces/LinkedInJob.md)[]\>

Defined in: [src/lib/scraping/linkedin.ts:94](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/scraping/linkedin.ts#L94)

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
