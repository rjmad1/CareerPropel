[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / BulletValidationStatus

# Type Alias: BulletValidationStatus

> **BulletValidationStatus** = `"strong"` \| `"moderate"` \| `"weak"` \| `"rejected"`

Defined in: [src/lib/document/bulletValidator.ts:9](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/document/bulletValidator.ts#L9)

Bullet Validator

Enforces the rule: Action Verb → Scope → Result → Metric.
Rejects vague, filler, or duty-listing bullets.
Every bullet that passes this validator is safe for ATS + recruiter review.
