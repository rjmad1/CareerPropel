[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / extractJobKeywords

# Function: extractJobKeywords()

> **extractJobKeywords**(`jobTitle`, `jobDescription`): [`ExtractedKeywords`](../interfaces/ExtractedKeywords.md)

Defined in: [src/lib/ats/keywordExtractor.ts:175](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/ats/keywordExtractor.ts#L175)

Extract all keyword categories from a job description.

Output is deduplicated per category. Exact phrasing is preserved —
no synonymization is applied here.

## Parameters

### jobTitle

`string`

### jobDescription

`string`

## Returns

[`ExtractedKeywords`](../interfaces/ExtractedKeywords.md)
