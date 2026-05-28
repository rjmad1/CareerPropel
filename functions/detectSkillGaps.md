[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / detectSkillGaps

# Function: detectSkillGaps()

> **detectSkillGaps**(`profile`, `jobDescriptions`): `object`

Defined in: [src/lib/profile/profileService.ts:291](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/profileService.ts#L291)

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
