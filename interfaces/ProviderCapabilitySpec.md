[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / ProviderCapabilitySpec

# Interface: ProviderCapabilitySpec

Defined in: [src/lib/governance/providerQualification.ts:15](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L15)

## Properties

### allowedProviders

> **allowedProviders**: [`LLMProviderName`](../type-aliases/LLMProviderName.md)[]

Defined in: [src/lib/governance/providerQualification.ts:16](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L16)

***

### minModelTier

> **minModelTier**: [`ModelTier`](../type-aliases/ModelTier.md)

Defined in: [src/lib/governance/providerQualification.ts:18](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L18)

Minimum model tier required

***

### rationale

> **rationale**: `string`

Defined in: [src/lib/governance/providerQualification.ts:20](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L20)

Rationale for the restriction

***

### requiresHighFactuality

> **requiresHighFactuality**: `boolean`

Defined in: [src/lib/governance/providerQualification.ts:24](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L24)

Whether high factuality is required (salary, company data)

***

### requiresLowHallucination

> **requiresLowHallucination**: `boolean`

Defined in: [src/lib/governance/providerQualification.ts:22](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/governance/providerQualification.ts#L22)

Whether hallucination-low models are required
