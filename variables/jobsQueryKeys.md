[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / jobsQueryKeys

# Variable: jobsQueryKeys

> `const` **jobsQueryKeys**: `object`

Defined in: [src/hooks/useJobs.ts:13](https://github.com/rjmad1/CareerPropel/blob/1a201d07e0e7032a443e43e3eff7cdd09c8f364d/src/hooks/useJobs.ts#L13)

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
