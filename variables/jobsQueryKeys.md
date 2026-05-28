[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / jobsQueryKeys

# Variable: jobsQueryKeys

> `const` **jobsQueryKeys**: `object`

Defined in: [src/hooks/useJobs.ts:13](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/hooks/useJobs.ts#L13)

## Type Declaration

### all

> **all**: readonly \[`"jobs"`\]

### detail

> **detail**: (`id`) => readonly \[`"jobs"`, `"detail"`, `string`\]

#### Parameters

##### id

`string`

#### Returns

readonly \[`"jobs"`, `"detail"`, `string`\]

### details

> **details**: () => readonly \[`"jobs"`, `"detail"`\]

#### Returns

readonly \[`"jobs"`, `"detail"`\]

### list

> **list**: (`filters?`, `sort?`) => readonly \[`"jobs"`, `"list"`, \{ `filters`: [`JobFilter`](../interfaces/JobFilter.md) \| `undefined`; `sort`: [`JobSort`](../interfaces/JobSort.md) \| `undefined`; \}\]

#### Parameters

##### filters?

[`JobFilter`](../interfaces/JobFilter.md)

##### sort?

[`JobSort`](../interfaces/JobSort.md)

#### Returns

readonly \[`"jobs"`, `"list"`, \{ `filters`: [`JobFilter`](../interfaces/JobFilter.md) \| `undefined`; `sort`: [`JobSort`](../interfaces/JobSort.md) \| `undefined`; \}\]

### lists

> **lists**: () => readonly \[`"jobs"`, `"list"`\]

#### Returns

readonly \[`"jobs"`, `"list"`\]
