[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / detectSkillGaps

# Function: detectSkillGaps()

> **detectSkillGaps**(`profile`, `jobDescriptions`): `object`

Defined in: [src/lib/profile/profileService.ts:291](https://github.com/rjmad1/CareerPropel/blob/696daa5eca6f5c3d803d391773100ae70ced93d0/src/lib/profile/profileService.ts#L291)

Detect skill gaps by comparing profile to job descriptions

## Parameters

### profile

`any`

### jobDescriptions

`string`[]

## Returns

`object`

### gapLevel

> **gapLevel**: `"low"` \| `"medium"` \| `"high"`

### missingSkills

> **missingSkills**: `string`[]

### recommendations

> **recommendations**: `string`[]
