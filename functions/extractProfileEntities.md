[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / extractProfileEntities

# Function: extractProfileEntities()

> **extractProfileEntities**(`text`, `source?`, `candidateId?`): [`ProfileEntity`](../interfaces/ProfileEntity.md)[]

Defined in: [src/lib/profile/extractor.ts:47](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/lib/profile/extractor.ts#L47)

Extract semantic entities from plain text

## Parameters

### text

`string`

### source?

`"resume"` \| `"manual"` \| `"linkedin"` \| `"cover_letter"`

### candidateId?

`string` = `'temp_candidate'`

## Returns

[`ProfileEntity`](../interfaces/ProfileEntity.md)[]
