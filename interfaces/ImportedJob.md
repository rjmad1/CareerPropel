[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ImportedJob

# Interface: ImportedJob

Defined in: [src/lib/scraping/provider.ts:9](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L9)

Scraping Provider Abstraction Layer & Contracts

Implements Phase 2: Decoupled capability contracts allowing the platform
to transition seamlessly from CSS-based Playwright scraping to official
OAuth APIs (such as LinkedIn Partner APIs) in the future.

## Properties

### company

> **company**: `string`

Defined in: [src/lib/scraping/provider.ts:13](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L13)

***

### department

> **department**: `string` \| `null`

Defined in: [src/lib/scraping/provider.ts:19](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L19)

***

### description

> **description**: `string`

Defined in: [src/lib/scraping/provider.ts:15](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L15)

***

### externalId

> **externalId**: `string` \| `null`

Defined in: [src/lib/scraping/provider.ts:11](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L11)

***

### location

> **location**: `string`

Defined in: [src/lib/scraping/provider.ts:14](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L14)

***

### postedAt

> **postedAt**: `string`

Defined in: [src/lib/scraping/provider.ts:17](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L17)

***

### salary

> **salary**: `string` \| `null`

Defined in: [src/lib/scraping/provider.ts:18](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L18)

***

### source

> **source**: `"linkedin"` \| `"greenhouse"` \| `"indeed"` \| `"lever"` \| `"ashby"`

Defined in: [src/lib/scraping/provider.ts:10](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L10)

***

### title

> **title**: `string`

Defined in: [src/lib/scraping/provider.ts:12](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L12)

***

### url

> **url**: `string`

Defined in: [src/lib/scraping/provider.ts:16](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/scraping/provider.ts#L16)
