[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ParserValidationSummary

# Interface: ParserValidationSummary

Defined in: [src/lib/ats/parsers/index.ts:8](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L8)

ATS Parser Validation Pipeline

Simulates what ATS parsers do when they ingest a resume.
Validates machine-readability across six dimensions.

## Properties

### chronologyScore

> **chronologyScore**: `number`

Defined in: [src/lib/ats/parsers/index.ts:17](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L17)

0–10 for ATS score chronology component

***

### chronologyValid

> **chronologyValid**: `boolean`

Defined in: [src/lib/ats/parsers/index.ts:13](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L13)

***

### contactValid

> **contactValid**: `boolean`

Defined in: [src/lib/ats/parsers/index.ts:11](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L11)

***

### datesValid

> **datesValid**: `boolean`

Defined in: [src/lib/ats/parsers/index.ts:10](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L10)

***

### errors

> **errors**: `string`[]

Defined in: [src/lib/ats/parsers/index.ts:19](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L19)

***

### formatScore

> **formatScore**: `number`

Defined in: [src/lib/ats/parsers/index.ts:15](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L15)

0–20 for ATS score format component

***

### headingsValid

> **headingsValid**: `boolean`

Defined in: [src/lib/ats/parsers/index.ts:9](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L9)

***

### recommendations

> **recommendations**: `string`[]

Defined in: [src/lib/ats/parsers/index.ts:20](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L20)

***

### sectionsDetected

> **sectionsDetected**: `string`[]

Defined in: [src/lib/ats/parsers/index.ts:12](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L12)

***

### warnings

> **warnings**: `string`[]

Defined in: [src/lib/ats/parsers/index.ts:18](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/ats/parsers/index.ts#L18)
