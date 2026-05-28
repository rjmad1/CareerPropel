[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / CompanyProfile

# Interface: CompanyProfile

Defined in: [src/types/company.ts:11](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L11)

Company profile with research data

## Properties

### benefits

> **benefits**: `object`

Defined in: [src/types/company.ts:60](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L60)

#### bonusStructure?

> `optional` **bonusStructure?**: `string`

#### dental

> **dental**: `boolean`

#### flexibleHours

> **flexibleHours**: `boolean`

#### healthInsurance

> **healthInsurance**: `boolean`

#### other

> **other**: `string`[]

#### parental\_leave\_weeks?

> `optional` **parental\_leave\_weeks?**: `number`

#### remoteWork

> **remoteWork**: `boolean`

#### retirement401k

> **retirement401k**: `boolean`

#### stockOptions

> **stockOptions**: `boolean`

#### vision

> **vision**: `boolean`

***

### competitors

> **competitors**: `string`[]

Defined in: [src/types/company.ts:82](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L82)

***

### createdAt

> **createdAt**: `Date`

Defined in: [src/types/company.ts:87](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L87)

***

### culture

> **culture**: `object`

Defined in: [src/types/company.ts:50](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L50)

#### description

> **description**: `string`

#### reportedCulture?

> `optional` **reportedCulture?**: `object`

##### reportedCulture.descriptions

> **descriptions**: `string`[]

##### reportedCulture.glassdoorScore?

> `optional` **glassdoorScore?**: `number`

##### reportedCulture.timeWarnerScore?

> `optional` **timeWarnerScore?**: `number`

#### values

> **values**: `string`[]

#### workStyle

> **workStyle**: `string`

***

### dataQuality

> **dataQuality**: `"high"` \| `"low"` \| `"medium"` \| `"verified"`

Defined in: [src/types/company.ts:89](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L89)

***

### description

> **description**: `string`

Defined in: [src/types/company.ts:24](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L24)

***

### employees

> **employees**: `object`

Defined in: [src/types/company.ts:39](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L39)

#### engineering

> **engineering**: `number`

#### lastUpdated

> **lastUpdated**: `Date`

#### total

> **total**: `number`

***

### founded

> **founded**: `number`

Defined in: [src/types/company.ts:18](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L18)

***

### funding

> **funding**: [`FundingInfo`](FundingInfo.md)

Defined in: [src/types/company.ts:29](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L29)

***

### growthRate?

> `optional` **growthRate?**: `number`

Defined in: [src/types/company.ts:36](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L36)

***

### headquarters

> **headquarters**: `object`

Defined in: [src/types/company.ts:19](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L19)

#### city

> **city**: `string`

#### country

> **country**: `string`

#### state?

> `optional` **state?**: `string`

***

### hiringPatterns

> **hiringPatterns**: [`HiringPattern`](HiringPattern.md)

Defined in: [src/types/company.ts:74](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L74)

***

### id

> **id**: `string`

Defined in: [src/types/company.ts:12](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L12)

***

### industry

> **industry**: `string`

Defined in: [src/types/company.ts:15](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L15)

***

### infrastructure

> **infrastructure**: `string`[]

Defined in: [src/types/company.ts:47](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L47)

***

### interviewProcess

> **interviewProcess**: [`InterviewProcessInfo`](InterviewProcessInfo.md)

Defined in: [src/types/company.ts:75](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L75)

***

### investors

> **investors**: `string`[]

Defined in: [src/types/company.ts:84](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L84)

***

### lastUpdated

> **lastUpdated**: `Date`

Defined in: [src/types/company.ts:88](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L88)

***

### mission?

> `optional` **mission?**: `string`

Defined in: [src/types/company.ts:25](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L25)

***

### name

> **name**: `string`

Defined in: [src/types/company.ts:13](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L13)

***

### partners

> **partners**: `string`[]

Defined in: [src/types/company.ts:83](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L83)

***

### recentLayoffs?

> `optional` **recentLayoffs?**: [`Layoff`](Layoff.md)[]

Defined in: [src/types/company.ts:79](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L79)

***

### recentNews

> **recentNews**: [`NewsArticle`](NewsArticle.md)[]

Defined in: [src/types/company.ts:78](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L78)

***

### revenue?

> `optional` **revenue?**: `object`

Defined in: [src/types/company.ts:30](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L30)

#### annualRevenue?

> `optional` **annualRevenue?**: `number`

#### currency

> **currency**: `string`

#### fiscalYear

> **fiscalYear**: `number`

#### isPublic

> **isPublic**: `boolean`

***

### size

> **size**: [`CompanySize`](../type-aliases/CompanySize.md)

Defined in: [src/types/company.ts:17](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L17)

***

### sources

> **sources**: `string`[]

Defined in: [src/types/company.ts:90](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L90)

***

### subIndustry?

> `optional` **subIndustry?**: `string`

Defined in: [src/types/company.ts:16](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L16)

***

### technicalStack

> **technicalStack**: [`TechStackItem`](TechStackItem.md)[]

Defined in: [src/types/company.ts:46](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L46)

***

### vision?

> `optional` **vision?**: `string`

Defined in: [src/types/company.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L26)

***

### website?

> `optional` **website?**: `string`

Defined in: [src/types/company.ts:14](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/types/company.ts#L14)
