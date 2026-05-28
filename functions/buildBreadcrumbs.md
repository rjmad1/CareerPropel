[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildBreadcrumbs

# Function: buildBreadcrumbs()

> **buildBreadcrumbs**(`pathname`, `options?`): [`Breadcrumb`](../interfaces/Breadcrumb.md)[]

Defined in: [src/lib/navigation/breadcrumbs.ts:26](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/breadcrumbs.ts#L26)

Generate breadcrumbs for a given pathname.

Optionally supply `entityLabel` to override the label for the deepest
dynamic segment (e.g. job title, company name, document name).

## Parameters

### pathname

`string`

### options?

#### entityLabel?

`string`

Override label for the last dynamic segment, e.g. "Google SWE Role"

#### extra?

`object`[]

Additional dynamic segments appended after the main breadcrumb chain

## Returns

[`Breadcrumb`](../interfaces/Breadcrumb.md)[]
