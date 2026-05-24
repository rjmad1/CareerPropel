[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / detectSkillGaps

# Function: detectSkillGaps()

> **detectSkillGaps**(`profile`, `jobDescriptions`): `object`

Defined in: [src/lib/profile/profileService.ts:291](https://github.com/rjmad1/CareerPropel/blob/0d4fad15b81e49f3b873e8b104cec88970a01026/src/lib/profile/profileService.ts#L291)

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
