[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / BulletValidationStatus

# Type Alias: BulletValidationStatus

> **BulletValidationStatus** = `"strong"` \| `"moderate"` \| `"weak"` \| `"rejected"`

Defined in: [src/lib/document/bulletValidator.ts:9](https://github.com/rjmad1/CareerPropel/blob/5ee4707e2d92f783f3887535a834f186f97a5968/src/lib/document/bulletValidator.ts#L9)

Bullet Validator

Enforces the rule: Action Verb → Scope → Result → Metric.
Rejects vague, filler, or duty-listing bullets.
Every bullet that passes this validator is safe for ATS + recruiter review.
