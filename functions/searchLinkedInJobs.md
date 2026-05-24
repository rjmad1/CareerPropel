[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLinkedInJobs

# Function: searchLinkedInJobs()

> **searchLinkedInJobs**(`keywords`, `location?`, `limit?`): `Promise`\<[`LinkedInJob`](../interfaces/LinkedInJob.md)[]\>

Defined in: [src/lib/scraping/linkedin.ts:94](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/scraping/linkedin.ts#L94)

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
