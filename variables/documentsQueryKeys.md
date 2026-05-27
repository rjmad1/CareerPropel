[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / documentsQueryKeys

# Variable: documentsQueryKeys

> `const` **documentsQueryKeys**: `object`

Defined in: [src/hooks/useDocuments.ts:43](https://github.com/rjmad1/CareerPropel/blob/e86ab7fb637179cc2eaf74357ae1f99399302a0f/src/hooks/useDocuments.ts#L43)

## Type Declaration

### all

> **all**: readonly \[`"documents"`\]

### detail

> **detail**: (`id`) => readonly \[`"documents"`, `"detail"`, `string`\]

#### Parameters

##### id

`string`

#### Returns

readonly \[`"documents"`, `"detail"`, `string`\]

### list

> **list**: (`params?`) => readonly \[`"documents"`, `"list"`, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `type?`: `string`; \} \| `undefined`\]

#### Parameters

##### params?

###### jobId?

`string`

###### limit?

`number`

###### offset?

`number`

###### type?

`string`

#### Returns

readonly \[`"documents"`, `"list"`, \{ `jobId?`: `string`; `limit?`: `number`; `offset?`: `number`; `type?`: `string`; \} \| `undefined`\]

### lists

> **lists**: () => readonly \[`"documents"`, `"list"`\]

#### Returns

readonly \[`"documents"`, `"list"`\]
