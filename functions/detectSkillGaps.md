[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / detectSkillGaps

# Function: detectSkillGaps()

> **detectSkillGaps**(`profile`, `jobDescriptions`): `object`

Defined in: [src/lib/profile/profileService.ts:291](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/lib/profile/profileService.ts#L291)

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
