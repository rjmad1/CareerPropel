[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / FormatViolation

# Interface: FormatViolation

Defined in: [src/lib/document/atsFormatter.ts:21](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/atsFormatter.ts#L21)

ATS Formatter

Enforces ATS-safe formatting rules on generated document content.

ALLOWED:
 - Single-column linear layout (Markdown)
 - Standard headings: Experience, Skills, Education, Certifications, Projects
 - Plain bullet structures (- or •)
 - Consistent date formats

FORBIDDEN:
 - Tables
 - Multi-column layouts
 - Text boxes / dividers (heavy)
 - Icons / graphics / charts
 - Headers/footers
 - Complex typography

## Properties

### line?

> `optional` **line?**: `number`

Defined in: [src/lib/document/atsFormatter.ts:24](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/atsFormatter.ts#L24)

***

### message

> **message**: `string`

Defined in: [src/lib/document/atsFormatter.ts:23](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/atsFormatter.ts#L23)

***

### type

> **type**: `string`

Defined in: [src/lib/document/atsFormatter.ts:22](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/atsFormatter.ts#L22)
