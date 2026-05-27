[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / extractProfileEntities

# Function: extractProfileEntities()

> **extractProfileEntities**(`text`, `source?`, `candidateId?`): [`ProfileEntity`](../interfaces/ProfileEntity.md)[]

Defined in: [src/lib/profile/extractor.ts:47](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/profile/extractor.ts#L47)

Extract semantic entities from plain text

## Parameters

### text

`string`

### source?

`"manual"` \| `"linkedin"` \| `"resume"` \| `"cover_letter"`

### candidateId?

`string` = `'temp_candidate'`

## Returns

[`ProfileEntity`](../interfaces/ProfileEntity.md)[]
