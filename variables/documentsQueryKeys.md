[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / documentsQueryKeys

# Variable: documentsQueryKeys

> `const` **documentsQueryKeys**: `object`

Defined in: [src/hooks/useDocuments.ts:43](https://github.com/rjmad1/CareerPropel/blob/41bfc0cd19012c8b6055aff45ba5794ece20280a/src/hooks/useDocuments.ts#L43)

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
