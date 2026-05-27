[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / BulletValidationStatus

# Type Alias: BulletValidationStatus

> **BulletValidationStatus** = `"strong"` \| `"moderate"` \| `"weak"` \| `"rejected"`

Defined in: [src/lib/document/bulletValidator.ts:9](https://github.com/rjmad1/CareerPropel/blob/e27dc2255dfcd722bf066d42863ad645581bd8ce/src/lib/document/bulletValidator.ts#L9)

Bullet Validator

Enforces the rule: Action Verb → Scope → Result → Metric.
Rejects vague, filler, or duty-listing bullets.
Every bullet that passes this validator is safe for ATS + recruiter review.
