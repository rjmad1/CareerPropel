[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / MasterProfile

# Interface: MasterProfile

Defined in: [src/lib/profile/master-profile/types.ts:90](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L90)

## Properties

### accomplishments

> **accomplishments**: [`MasterAccomplishment`](MasterAccomplishment.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:118](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L118)

***

### assembledAt

> **assembledAt**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:98](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L98)

When this master profile was assembled

***

### candidateId

> **candidateId**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:92](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L92)

Candidate DB id — links back to the source of truth

***

### careerLevel

> **careerLevel**: `"mid"` \| `"senior"` \| `"staff"` \| `"principal"` \| `"entry"` \| `"executive"`

Defined in: [src/lib/profile/master-profile/types.ts:136](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L136)

***

### certifications

> **certifications**: [`MasterCertification`](MasterCertification.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:124](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L124)

***

### education

> **education**: [`MasterEducation`](MasterEducation.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:121](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L121)

***

### email

> **email**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:102](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L102)

***

### fullName

> **fullName**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:101](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L101)

***

### linkedInUrl?

> `optional` **linkedInUrl?**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:105](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L105)

***

### location?

> `optional` **location?**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:104](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L104)

***

### phone?

> `optional` **phone?**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:103](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L103)

***

### portfolioUrl?

> `optional` **portfolioUrl?**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:106](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L106)

***

### primaryIndustries

> **primaryIndustries**: `string`[]

Defined in: [src/lib/profile/master-profile/types.ts:134](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L134)

***

### professionalSummary

> **professionalSummary**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:109](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L109)

***

### profileVersionHash

> **profileVersionHash**: `string`

Defined in: [src/lib/profile/master-profile/types.ts:95](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L95)

Deterministic hash of the profile content — used for variant provenance

***

### projects

> **projects**: [`MasterProject`](MasterProject.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:127](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L127)

***

### roles

> **roles**: [`MasterRole`](MasterRole.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:112](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L112)

***

### skills

> **skills**: [`MasterSkill`](MasterSkill.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:115](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L115)

***

### starStories

> **starStories**: [`MasterStarStory`](MasterStarStory.md)[]

Defined in: [src/lib/profile/master-profile/types.ts:130](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L130)

***

### topSkills

> **topSkills**: `string`[]

Defined in: [src/lib/profile/master-profile/types.ts:135](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L135)

***

### totalYearsExperience

> **totalYearsExperience**: `number`

Defined in: [src/lib/profile/master-profile/types.ts:133](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/master-profile/types.ts#L133)
