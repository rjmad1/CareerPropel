[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / detectSkillGaps

# Function: detectSkillGaps()

> **detectSkillGaps**(`profile`, `jobDescriptions`): `object`

Defined in: [src/lib/profile/profileService.ts:291](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/lib/profile/profileService.ts#L291)

Detect skill gaps by comparing profile to job descriptions

## Parameters

### profile

`any`

### jobDescriptions

`string`[]

## Returns

`object`

### gapLevel

> **gapLevel**: `"high"` \| `"low"` \| `"medium"`

### missingSkills

> **missingSkills**: `string`[]

### recommendations

> **recommendations**: `string`[]
