[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / confirmNavigation

# Function: confirmNavigation()

> **confirmNavigation**(`message?`): `boolean`

Defined in: [src/lib/navigation/guards.ts:99](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/navigation/guards.ts#L99)

Ask the user to confirm navigation when guards are dirty.
Uses native `window.confirm` as a fallback; prefer the in-app
UnsavedChangesModal from useUnsavedChangesGuard hook for better UX.

## Parameters

### message?

`string`

## Returns

`boolean`
