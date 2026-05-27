[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / extractProfileEntities

# Function: extractProfileEntities()

> **extractProfileEntities**(`text`, `source?`, `candidateId?`): [`ProfileEntity`](../interfaces/ProfileEntity.md)[]

Defined in: [src/lib/profile/extractor.ts:47](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/profile/extractor.ts#L47)

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
