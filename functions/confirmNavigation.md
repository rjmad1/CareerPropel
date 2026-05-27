[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / confirmNavigation

# Function: confirmNavigation()

> **confirmNavigation**(`message?`): `boolean`

Defined in: [src/lib/navigation/guards.ts:99](https://github.com/rjmad1/CareerPropel/blob/6f11037d2e27aea9aee8d6e618e36db87eafc873/src/lib/navigation/guards.ts#L99)

Ask the user to confirm navigation when guards are dirty.
Uses native `window.confirm` as a fallback; prefer the in-app
UnsavedChangesModal from useUnsavedChangesGuard hook for better UX.

## Parameters

### message?

`string`

## Returns

`boolean`
