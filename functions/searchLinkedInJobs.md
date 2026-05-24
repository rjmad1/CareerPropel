[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / searchLinkedInJobs

# Function: searchLinkedInJobs()

> **searchLinkedInJobs**(`keywords`, `location?`, `limit?`): `Promise`\<[`LinkedInJob`](../interfaces/LinkedInJob.md)[]\>

Defined in: [src/lib/scraping/linkedin.ts:94](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/lib/scraping/linkedin.ts#L94)

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
