[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / OnboardingParams

# Interface: OnboardingParams

Defined in: [src/\_\_tests\_\_/unit/onboarding-presets.test.ts:9](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/__tests__/unit/onboarding-presets.test.ts#L9)

Unit Test Suite for AI Onboarding and Preset Mapping
Verifies:
- Outcome configurations correctly align with privacy preferences.
- Compute tiers accurately route to budget-appropriate providers.
- Local-only constraints correctly override cloud presets to loopbacks.

## Properties

### computeTier

> **computeTier**: `"free"` \| `"managed"` \| `"byo"`

Defined in: [src/\_\_tests\_\_/unit/onboarding-presets.test.ts:11](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/__tests__/unit/onboarding-presets.test.ts#L11)

***

### presetKey

> **presetKey**: `string`

Defined in: [src/\_\_tests\_\_/unit/onboarding-presets.test.ts:12](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/__tests__/unit/onboarding-presets.test.ts#L12)

***

### privacyMode

> **privacyMode**: `"local"` \| `"zero_retention"` \| `"enterprise"`

Defined in: [src/\_\_tests\_\_/unit/onboarding-presets.test.ts:10](https://github.com/rjmad1/CareerPropel/blob/9ca97abe8c0b77564443149665a511377590c3e8/src/__tests__/unit/onboarding-presets.test.ts#L10)
