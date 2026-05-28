[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / extractJobKeywords

# Function: extractJobKeywords()

> **extractJobKeywords**(`jobTitle`, `jobDescription`): [`ExtractedKeywords`](../interfaces/ExtractedKeywords.md)

Defined in: [src/lib/ats/keywordExtractor.ts:175](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/ats/keywordExtractor.ts#L175)

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
